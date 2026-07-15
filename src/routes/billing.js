const express = require('express');
const router = express.Router();
const { listBillings, createBilling, getBilling, updateBilling, deleteBilling, getRestaurant } = require('../models/store');
const { sendBill } = require('../services/emailService');
const { sendBillSms } = require('../services/smsService');

router.get('/', async (req, res) => {
  const list = await listBillings(req.query.restaurantId);
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const b = await getBilling(req.params.id);
  if (!b) return res.status(404).json({ error: 'Billing not found' });
  res.json(b);
});

router.get('/:id/view', async (req, res) => {
  const b = await getBilling(req.params.id);
  if (!b) return res.status(404).send('Billing not found');
  const restaurant = b.restaurantId ? await getRestaurant(b.restaurantId) : null;
  
  const itemsHtml = (b.foodItems || []).map(item => `
    <div style="display: flex; justify-content: space-between; font-size: 0.95rem; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 8px;">
      <span style="flex: 2; font-weight: 500; color: #fff;">${item.name}</span>
      <span style="flex: 1; text-align: center; opacity: 0.7; color: #a1a1aa;">x${item.quantity}</span>
      <span style="flex: 1; text-align: right; font-weight: 600; color: #34d399;">₹${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${b.orderNumber || ''}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #0f0f16;
      color: #e4e4e7;
      margin: 0;
      padding: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .receipt {
      background: #181825;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 24px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .header {
      text-align: center;
      border-bottom: 1px dashed rgba(255,255,255,0.15);
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .logo {
      font-size: 1.6rem;
      font-weight: 800;
      color: #10b981;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .outlet {
      font-size: 0.95rem;
      opacity: 0.75;
      color: #a1a1aa;
    }
    .details {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      opacity: 0.85;
      margin-bottom: 20px;
      background: rgba(255,255,255,0.02);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.04);
    }
    .divider {
      border-top: 1px solid rgba(255,255,255,0.08);
      margin: 20px 0;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      margin-bottom: 10px;
      color: #d4d4d8;
    }
    .grand-total {
      font-size: 1.25rem;
      font-weight: 800;
      color: #10b981;
      border-top: 1px dashed rgba(255,255,255,0.15);
      padding-top: 14px;
      margin-top: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 28px;
      font-size: 0.85rem;
      opacity: 0.65;
      color: #a1a1aa;
      border-top: 1px solid rgba(255,255,255,0.05);
      padding-top: 16px;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="logo">Engineering Tadka</div>
      <div class="outlet">${restaurant ? restaurant.name : 'Main Outlet'}</div>
    </div>
    <div class="details">
      <div>
        <strong>Order:</strong> #${b.orderNumber || 'N/A'}<br>
        <strong>Date:</strong> ${b.date || ''}
      </div>
      <div style="text-align: right;">
        <strong>Status:</strong> <span style="color: #10b981; font-weight: bold; background: rgba(16,185,129,0.1); padding: 4px 8px; border-radius: 4px;">PAID</span>
      </div>
    </div>
    <div class="items">
      ${itemsHtml}
    </div>
    <div class="divider"></div>
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>₹${(b.amount || 0).toFixed(2)}</span>
      </div>
      <div class="totals-row">
        <span>CGST (2.5%):</span>
        <span>₹${(b.cgst || 0).toFixed(2)}</span>
      </div>
      <div class="totals-row">
        <span>SGST (2.5%):</span>
        <span>₹${(b.sgst || 0).toFixed(2)}</span>
      </div>
      ${b.discount ? `
      <div class="totals-row" style="color: #f87171; font-weight: 600;">
        <span>Discount:</span>
        <span>-${b.discount}%</span>
      </div>` : ''}
      <div class="totals-row grand-total">
        <span>Grand Total:</span>
        <span>₹${(b.amount + (b.cgst || 0) + (b.sgst || 0)).toFixed(2)}</span>
      </div>
    </div>
    <div class="footer">
      Thank you for dining with us! Come back soon!
    </div>
  </div>
</body>
</html>
  `;
  res.send(htmlContent);
});

router.post('/', async (req, res) => {
  const { amount, restaurantId, date, description, status, mobile, emailId, cgst, sgst, foodItems, orderNumber, discount } = req.body;
  if (amount == null || !restaurantId) {
    return res.status(400).json({ error: 'amount and restaurantId are required' });
  }
  
  const created = await createBilling({ amount, restaurantId, date, description, status, mobile, emailId, cgst, sgst, foodItems, orderNumber, discount });

  if (emailId) {
    try {
      const restaurant = restaurantId ? await getRestaurant(restaurantId) : null;
      const emailResult = await sendBill(created, restaurant, emailId);
      created.emailStatus = emailResult.record.status;
      if (!emailResult.success) {
        created.emailError = emailResult.record.error || 'Email delivery failed';
      }
    } catch (err) {
      console.error('Email send error:', err);
      created.emailStatus = 'failed';
      created.emailError = err.message;
    }
  }

  // SMS billing commented out for now
  /*
  if (mobile) {
    try {
      const restaurant = restaurantId ? await getRestaurant(restaurantId) : null;
      await sendBillSms(created, restaurant, mobile);
    } catch (err) {
      console.error('SMS send error:', err);
    }
  }
  */

  res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const updated = await updateBilling(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Billing not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteBilling(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Billing not found' });
  res.status(204).send();
});

module.exports = router;
