const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment from ETMSN/.env
dotenv.config({ path: 'c:/EngineeringTadka/ETMSN/.env' });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-management';

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
  
  const FoodItemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String },
    description: { type: String },
    active: { type: Boolean, default: true }
  }, { collection: 'fooditems' });
  
  const FoodItem = mongoose.models.FoodItem || mongoose.model('FoodItem', FoodItemSchema);
  
  const items = [
    { id: 'item-23', name: 'Thums Up', price: 40, category: 'Beverages', description: 'Thums Up can', restaurantId: 'default-restaurant-id', active: true },
    { id: 'item-24', name: 'Frooti', price: 40, category: 'Beverages', description: 'Frooti Mango Drink', restaurantId: 'default-restaurant-id', active: true }
  ];
  
  for (const item of items) {
    const exists = await FoodItem.findOne({ name: { $regex: new RegExp('^' + item.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') } });
    if (!exists) {
      const doc = new FoodItem(item);
      await doc.save();
      console.log(`Successfully seeded ${item.name}`);
    } else {
      console.log(`${item.name} already exists in DB`);
    }
  }
  
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

run().catch(console.error);
