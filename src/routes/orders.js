const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { listOrders, createOrder, getOrder, updateOrder, deleteOrder, getRestaurant } = require('../models/store');
const { sendOrderMailToKitchen } = require('../services/emailService');

// Initialize Razorpay client
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder') {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

router.get('/', async (req, res) => {
  const list = await listOrders(req.query.restaurantId);
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const order = await getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

router.post('/', async (req, res) => {
  const { restaurantId, tableNo, mobile, emailId, items, status, totalAmount, date, discount, orderType, paymentMode, cashAmount, upiAmount } = req.body;
  if (!restaurantId) {
    return res.status(400).json({ error: 'restaurantId is required' });
  }

  const isOnlinePayment = paymentMode === 'Razorpay';
  const initialStatus = isOnlinePayment ? 'pending_payment' : (status || 'received');

  const created = await createOrder({
    restaurantId,
    tableNo,
    mobile,
    emailId,
    items,
    status: initialStatus,
    totalAmount,
    date,
    discount,
    orderType,
    paymentMode: paymentMode || 'Cash',
    paymentStatus: isOnlinePayment ? 'pending' : 'paid',
    cashAmount: cashAmount || 0,
    upiAmount: upiAmount || 0
  });

  if (isOnlinePayment) {
    if (!razorpay) {
      // Mock bypass flow for testing with placeholder credentials
      if (process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder') {
        console.log('⚠️ Using mock Razorpay order creation (placeholder keys detected)');
        const mockRazorpayOrder = {
          id: 'order_mock_' + created.id.substring(0, 10).replace(/-/g, ''),
          amount: Math.round(totalAmount * 100),
          currency: 'INR',
          receipt: created.id
        };
        return res.status(201).json({
          order: created,
          razorpayOrder: mockRazorpayOrder,
          razorpayKeyId: 'rzp_test_placeholder',
          isMock: true
        });
      }
      return res.status(500).json({ error: 'Razorpay keys are not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your backend .env file.' });
    }

    try {
      const options = {
        amount: Math.round(totalAmount * 100), // in paise
        currency: 'INR',
        receipt: created.id
      };
      const rzpOrder = await razorpay.orders.create(options);

      // Save Razorpay Order ID to database order record
      await updateOrder(created.id, { razorpayOrderId: rzpOrder.id });

      return res.status(201).json({
        order: { ...created, razorpayOrderId: rzpOrder.id },
        razorpayOrder: rzpOrder,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
      });
    } catch (err) {
      console.error('Razorpay Order Creation Error:', err);
      return res.status(500).json({ error: 'Failed to initiate online payment via Razorpay: ' + err.message });
    }
  }

  if (created && created.status === 'received') {
    (async () => {
      try {
        const restaurant = created.restaurantId ? await getRestaurant(created.restaurantId) : null;
        await sendOrderMailToKitchen(created, restaurant);
      } catch (err) {
        console.error('Error sending order email to kitchen:', err);
      }
    })();
  }

  res.status(201).json(created);
});

router.post('/verify-payment', async (req, res) => {
  const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
  if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    return res.status(400).json({ error: 'All payment fields are required' });
  }

  const order = await getOrder(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Handle verification check for Mock bypass
  if (razorpayOrderId.startsWith('order_mock_') || razorpaySignature === 'mock_signature') {
    await updateOrder(orderId, {
      status: 'received',
      paymentStatus: 'paid',
      razorpayPaymentId,
      razorpaySignature: 'mock_signature'
    });
    (async () => {
      try {
        const updatedOrder = await getOrder(orderId);
        if (updatedOrder) {
          const restaurant = updatedOrder.restaurantId ? await getRestaurant(updatedOrder.restaurantId) : null;
          await sendOrderMailToKitchen(updatedOrder, restaurant);
        }
      } catch (err) {
        console.error('Error sending order email to kitchen:', err);
      }
    })();
    return res.json({ success: true, message: 'Mock payment verified successfully' });
  }

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret');
  hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature === razorpaySignature) {
    await updateOrder(orderId, {
      status: 'received',
      paymentStatus: 'paid',
      razorpayPaymentId,
      razorpaySignature
    });
    (async () => {
      try {
        const updatedOrder = await getOrder(orderId);
        if (updatedOrder) {
          const restaurant = updatedOrder.restaurantId ? await getRestaurant(updatedOrder.restaurantId) : null;
          await sendOrderMailToKitchen(updatedOrder, restaurant);
        }
      } catch (err) {
        console.error('Error sending order email to kitchen:', err);
      }
    })();
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ error: 'Invalid payment signature' });
  }
});

router.put('/:id', async (req, res) => {
  const updated = await updateOrder(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteOrder(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Order not found' });
  res.status(204).send();
});

module.exports = router;
