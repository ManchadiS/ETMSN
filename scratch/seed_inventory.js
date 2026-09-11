const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config({ path: 'c:/EngineeringTadka/ETMSN/.env' });
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-management';

const inventoryCatalog = [
  // 1. Poultry & Meats
  { name: 'CHICKEN', quantity: 25, unit: 'kg', threshold: 5 },
  { name: 'Chicken Drumsticks', quantity: 40, unit: 'pcs', threshold: 10 },

  // 2. Dairy & Cheeses
  { name: 'WARANA MALAI PANEER', quantity: 15, unit: 'kg', threshold: 3 },
  { name: 'Hung Curd (Dahi)', quantity: 10, unit: 'kg', threshold: 2 },
  { name: 'Fresh Milk (Amul Taaza)', quantity: 30, unit: 'litres', threshold: 5 },
  { name: 'Amul Butter', quantity: 10, unit: 'kg', threshold: 2 },
  { name: 'Blend Shredded Cheese', quantity: 8, unit: 'kg', threshold: 2 },
  { name: 'Desi Ghee', quantity: 5, unit: 'litres', threshold: 1 },

  // 3. Breads, Grains & Bases
  { name: 'Jumbo Sandwich Bread', quantity: 20, unit: 'pkts', threshold: 4 },
  { name: 'Kubbos / Pita Flatbread', quantity: 60, unit: 'pcs', threshold: 15 },
  { name: 'Basmati Biryani Rice', quantity: 25, unit: 'kg', threshold: 5 },
  { name: 'Maggi Noodles (Pack)', quantity: 50, unit: 'pkts', threshold: 10 },
  { name: 'Papdi Puri', quantity: 15, unit: 'pkts', threshold: 3 },
  { name: 'Nylon Shev', quantity: 5, unit: 'kg', threshold: 1 },

  // 4. Fries & Frozen Starters
  { name: 'Frozen Potato French Fries', quantity: 20, unit: 'kg', threshold: 5 },

  // 5. Seasonings, Sauces, Syrups & Spices
  { name: 'Garlic Eggless Mayonnaise', quantity: 12, unit: 'kg', threshold: 2 },
  { name: 'Cooking Oil', quantity: 15, unit: 'litres', threshold: 3 },
  { name: 'Biryani Spice Mix', quantity: 5, unit: 'kg', threshold: 1 },
  { name: 'Peri Peri Seasoning', quantity: 3, unit: 'kg', threshold: 0.5 },
  { name: 'Tikka Marinade Masala', quantity: 4, unit: 'kg', threshold: 0.5 },
  { name: 'Mint Chutney', quantity: 5, unit: 'kg', threshold: 1 },
  { name: 'Tamarind Sweet Chutney', quantity: 5, unit: 'kg', threshold: 1 },
  { name: 'Tea Leaves & Chai Masala', quantity: 3, unit: 'kg', threshold: 0.5 },
  { name: 'Espresso Coffee Powder', quantity: 3, unit: 'kg', threshold: 0.5 },
  { name: 'Cocoa & Chocolate Powder', quantity: 3, unit: 'kg', threshold: 0.5 },
  { name: 'Chocolate Syrup', quantity: 5, unit: 'litres', threshold: 1 },
  { name: 'Strawberry Fruit Crush', quantity: 5, unit: 'litres', threshold: 1 },
  { name: 'Alphonso Mango Pulp', quantity: 5, unit: 'litres', threshold: 1 },
  { name: 'Mojito Mint Syrup', quantity: 4, unit: 'litres', threshold: 1 },
  { name: 'Fresh Lemons', quantity: 50, unit: 'pcs', threshold: 10 },
  { name: 'Sugar', quantity: 15, unit: 'kg', threshold: 3 },
  { name: 'Club Soda', quantity: 30, unit: 'cans', threshold: 5 },

  // 6. Packaged Beverages (MRP Units)
  { name: 'Diet Coke Can 300ml', quantity: 24, unit: 'cans', threshold: 6 },
  { name: 'Thums Up Can 300ml', quantity: 36, unit: 'cans', threshold: 6 },
  { name: 'Sprite Can 300ml', quantity: 36, unit: 'cans', threshold: 6 },
  { name: 'Frooti 150ml', quantity: 48, unit: 'pkts', threshold: 10 },
  { name: 'Packaged Water Bottle 500ml', quantity: 60, unit: 'pcs', threshold: 12 },

  // 7. Disposables & Packaging
  { name: 'Sandwich Packaging Box', quantity: 100, unit: 'pcs', threshold: 20 },
  { name: 'Shawarma Foil Wrap', quantity: 150, unit: 'pcs', threshold: 30 },
  { name: 'Biryani Container 750ml', quantity: 50, unit: 'pcs', threshold: 10 },
  { name: 'Starter / Fries Serving Box', quantity: 100, unit: 'pcs', threshold: 20 },
  { name: 'Beverage Cups & Glasses', quantity: 150, unit: 'pcs', threshold: 30 },
  { name: 'Paper Straws', quantity: 200, unit: 'pcs', threshold: 40 }
];

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB:", uri);

    const RestaurantSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      name: { type: String, required: true }
    }, { collection: 'restaurants', strict: false });

    const InventorySchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      restaurantId: { type: String, required: true },
      name: { type: String, required: true },
      quantity: { type: Number, default: 0 },
      unit: { type: String, default: 'units' },
      threshold: { type: Number, default: 10 }
    }, { collection: 'inventories' });

    const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);
    const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);

    const restaurants = await Restaurant.find({});
    let restIds = restaurants.map(r => r.id);
    if (restIds.length === 0) {
      restIds = ['default-restaurant-id'];
    }

    console.log("Syncing inventory for restaurants:", restIds);

    for (const restId of restIds) {
      for (const itemDef of inventoryCatalog) {
        // Case-insensitive match on name for this restaurant
        const existing = await Inventory.findOne({
          restaurantId: restId,
          name: { $regex: new RegExp(`^${itemDef.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
        });

        if (existing) {
          existing.unit = itemDef.unit;
          existing.threshold = itemDef.threshold;
          // Keep current quantity if > 0, else assign default initial stock
          if (existing.quantity === undefined || existing.quantity === 0) {
            existing.quantity = itemDef.quantity;
          }
          await existing.save();
          console.log(`Updated inventory item: ${existing.name} (${existing.unit}) - Qty: ${existing.quantity}`);
        } else {
          const newItem = new Inventory({
            id: uuidv4(),
            restaurantId: restId,
            name: itemDef.name,
            quantity: itemDef.quantity,
            unit: itemDef.unit,
            threshold: itemDef.threshold
          });
          await newItem.save();
          console.log(`Created inventory item: ${newItem.name} (${newItem.unit}) - Qty: ${newItem.quantity}`);
        }
      }
    }

    console.log("✅ Successfully synced clean inventory items into MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding inventory:", err);
    process.exit(1);
  }
}

run();
