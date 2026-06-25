const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant-management';

const RestaurantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String }
}, { timestamps: true, id: false });

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

async function run() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  const all = await Restaurant.find({});
  console.log('All restaurants in DB:', JSON.stringify(all, null, 2));
  
  // Print both virtual id and custom field id for each doc
  for (const doc of all) {
    console.log('doc._id:', doc._id.toString());
    console.log('doc.id (virtual/field):', doc.id);
    console.log("doc.get('id'):", doc.get('id'));
  }
  
  await mongoose.connection.close();
}

run().catch(console.error);
