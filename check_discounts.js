const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant-management';
async function run() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const BillingSchema = new mongoose.Schema({
    id: String,
    amount: Number,
    cgst: Number,
    sgst: Number,
    discount: Number,
    paymentMode: String,
    date: String
  }, { collection: 'billings' });

  const Billing = mongoose.model('Billing', BillingSchema);

  const bills = await Billing.find({});
  console.log(`Found ${bills.length} bills:`);

  for (const b of bills) {
    if (b.discount > 0) {
      const discountPercent = b.discount;
      const amount = b.amount || 0;
      const itemsTotal = amount / (1 - discountPercent / 100);
      const discountAmount = (itemsTotal * discountPercent) / 100;

      console.log({
        id: b.id,
        date: b.date,
        amount: b.amount,
        cgst: b.cgst,
        sgst: b.sgst,
        discountPercent: b.discount,
        calculatedDiscountAmount: discountAmount
      });
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
