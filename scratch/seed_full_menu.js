const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'c:/EngineeringTadka/ETMSN/.env' });
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-management';

const fullMenuCatalog = [
  // 1. Shawarma
  { name: 'Chicken Shawarma', price: 100, category: 'Shawarma', description: 'Grilled seasoned chicken rolled in warm flatbread with signature garlic sauce' },
  { name: 'Cheesy Chicken Shawarma', price: 130, category: 'Shawarma', description: 'Loaded with melted cheese and tender seasoned chicken' },
  { name: 'Hariyali Chicken Shawarma', price: 120, category: 'Shawarma', description: 'Infused with fresh mint and coriander herb marinade' },
  { name: 'Peri Peri Chicken Shawarma', price: 120, category: 'Shawarma', description: 'Fiery peri-peri spiced chicken shawarma wrap' },
  { name: 'Malai Chicken Shawarma', price: 150, category: 'Shawarma', description: 'Creamy rich malai chicken with mild spices' },
  { name: 'Paneer Shawarma', price: 100, category: 'Shawarma', description: 'Fresh paneer cubes tossed in aromatic spices' },
  { name: 'Cheesy Paneer Shawarma', price: 130, category: 'Shawarma', description: 'Gooey cheese blend over succulent paneer cubes' },
  { name: 'Hariyali Paneer Shawarma', price: 120, category: 'Shawarma', description: 'Herbed green spiced paneer wrap' },
  { name: 'Peri Peri Paneer Shawarma', price: 120, category: 'Shawarma', description: 'Spicy peri peri glazed soft cottage cheese' },
  { name: 'Malai Paneer Shawarma', price: 150, category: 'Shawarma', description: 'Rich creamy malai paneer rolled in bread' },

  // 2. Sandwiches
  { name: 'Chicken Sandwich', price: 100, category: 'Sandwiches', description: 'Classic seasoned chicken slices with crisp veggies' },
  { name: 'Chicken Cheese Sandwich', price: 130, category: 'Sandwiches', description: 'Seasoned chicken paired with melted cheese' },
  { name: 'Grilled Chicken Sandwich', price: 120, category: 'Sandwiches', description: 'Golden grilled sandwich packed with chicken' },
  { name: 'Grilled Cheese Chicken Sandwich', price: 140, category: 'Sandwiches', description: 'Double grilled sandwich loaded with chicken & gooey cheese' },
  { name: 'Paneer Sandwich', price: 100, category: 'Sandwiches', description: 'Freshly seasoned paneer slices and crisp greens' },
  { name: 'Paneer Cheese Sandwich', price: 130, category: 'Sandwiches', description: 'Paneer with melted cheddar and mozzarella cheese' },
  { name: 'Grilled Paneer Sandwich', price: 120, category: 'Sandwiches', description: 'Toasted crisp bread layered with spiced paneer filling' },
  { name: 'Grilled Paneer Cheese Sandwich', price: 140, category: 'Sandwiches', description: 'Grilled sandwich with paneer and overloaded melted cheese' },

  // 3. Sides
  { name: 'Chicken Drumstick (2pc)', price: 280, category: 'Sides', description: 'Crispy deep-fried golden chicken drumsticks (2 pcs)' },
  { name: 'Chicken Shev Puri', price: 120, category: 'Sides', description: 'Crisp puris stuffed with spiced chicken, chutneys and sev' },
  { name: 'Dahi Kebab (6pc)', price: 150, category: 'Sides', description: 'Crisp on the outside, creamy hung curd spiced kebabs (6 pcs)' },
  { name: 'Paneer Tikka (6pc)', price: 220, category: 'Sides', description: 'Clay-oven charred spicy cottage cheese chunks (6 pcs)' },
  { name: 'French Fries', price: 90, category: 'Sides', description: 'Crispy salted golden potato fries with dip' },
  { name: 'Peri Peri French Fries', price: 120, category: 'Sides', description: 'Crispy french fries dusted with spicy peri peri seasoning' },
  { name: 'Cheesy French Fries', price: 150, category: 'Sides', description: 'Golden fries drenched in warm melted cheese sauce' },

  // 4. Mains
  { name: 'Chicken Dum Biryani', price: 200, category: 'Main Course', description: 'Slow-cooked aromatic basmati rice with tender spiced chicken' },
  { name: 'Masala Maggi', price: 80, category: 'Main Course', description: 'Street style spiced instant noodles cooked with veggies' },

  // 5. Drinks
  { name: 'Tea', price: 30, category: 'Beverages', description: 'Traditional Indian masala milk chai served hot' },
  { name: 'Hot Coffee', price: 40, category: 'Beverages', description: 'Freshly brewed rich hot espresso coffee' },
  { name: 'Cold Coffee', price: 100, category: 'Beverages', description: 'Chilled blended creamy coffee topped with chocolate powder' },
  { name: 'Caffe Mocha', price: 160, category: 'Beverages', description: 'Espresso with rich chocolate, steamed milk and whipped cream' },
  { name: 'Chocolate Milkshake', price: 130, category: 'Beverages', description: 'Thick and decadent chocolate milkshake with whipped topping' },
  { name: 'Strawberry Milk Shake', price: 130, category: 'Beverages', description: 'Luscious pink strawberry milkshake with real fruit essence' },
  { name: 'Mango Milk Shake', price: 130, category: 'Beverages', description: 'Thick creamy mango shake made from juicy Alphonso pulp' },
  { name: 'Lemon Mojito', price: 80, category: 'Beverages', description: 'Sparkling mint and zesty fresh lime refresher over ice' },
  { name: 'Cold Drinks', price: 20, category: 'Beverages', description: 'Assorted chilled soft drinks' },
  { name: 'Diet Coke', price: 50, category: 'Beverages', description: 'Chilled Coca-Cola can' },
  { name: 'Thums Up', price: 40, category: 'Beverages', description: 'Chilled Thums Up can' },
  { name: 'Sprite', price: 40, category: 'Beverages', description: 'Chilled Sprite can' },
  { name: 'Frooti', price: 10, category: 'Beverages', description: 'Frooti Mango Drink' },
  { name: 'Water', price: 10, category: 'Beverages', description: 'Packaged mineral water bottle' },

  // 6. Value Pre-set Combos
  { name: 'Combo 1: Sandwich + Fries + Milk Shake', price: 290, category: 'Combos', description: 'Grilled layered sandwich served with crispy golden fries and luscious milk shake' },
  { name: 'Combo 2: Sandwich + Cold Coffee', price: 180, category: 'Combos', description: 'Fresh toasted sandwich paired with refreshing thick iced cold coffee' },
  { name: 'Combo 3: Sandwich + Tea + Fries', price: 200, category: 'Combos', description: 'Crisp sandwich served with authentic hot masala chai and french fries' },
  { name: 'Combo 4: Biryani + Coke', price: 230, category: 'Combos', description: 'Aromatic chicken dum biryani paired with a chilled can of Coca-Cola' },
  { name: 'Combo 5: Chicken Drumstick (2pc) + Fries + Milk Shake', price: 450, category: 'Combos', description: '2 crispy fried chicken drumsticks with french fries and decadent milk shake' },
  { name: 'Tadka Special: Drum Stick (1pc) + Paneer Tikka (2pc) + Dahi Kebab (2pc) + Milk Shake', price: 350, category: 'Combos', description: 'Signature feast platter with 1 drumstick, 2 paneer tikka, 2 dahi kebab & strawberry milk shake' }
];

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB:", uri);

  const RestaurantSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true }
  }, { collection: 'restaurants', strict: false });

  const FoodItemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String },
    description: { type: String },
    active: { type: Boolean, default: true }
  }, { collection: 'fooditems' });

  const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);
  const FoodItem = mongoose.models.FoodItem || mongoose.model('FoodItem', FoodItemSchema);

  const restaurants = await Restaurant.find({});
  let restIds = restaurants.map(r => r.id);
  if (restIds.length === 0) {
    restIds = ['default-restaurant-id'];
  }

  console.log("Syncing food items for restaurants:", restIds);

  for (const restId of restIds) {
    for (let idx = 0; idx < fullMenuCatalog.length; idx++) {
      const itemDef = fullMenuCatalog[idx];
      const regex = new RegExp('^' + itemDef.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');

      const existing = await FoodItem.findOne({
        restaurantId: restId,
        name: { $regex: regex }
      });

      if (existing) {
        existing.price = itemDef.price;
        existing.category = itemDef.category;
        existing.description = itemDef.description;
        existing.active = true;
        await existing.save();
        console.log(`[${restId}] Updated ${itemDef.name} (₹${itemDef.price})`);
      } else {
        const newId = `item-${restId}-${idx + 1}-${Date.now()}`;
        const doc = new FoodItem({
          id: newId,
          restaurantId: restId,
          name: itemDef.name,
          price: itemDef.price,
          category: itemDef.category,
          description: itemDef.description,
          active: true
        });
        await doc.save();
        console.log(`[${restId}] Inserted NEW ${itemDef.name} (₹${itemDef.price})`);
      }
    }
  }

  console.log("✅ All menu items synchronized successfully in MongoDB!");
  await mongoose.disconnect();
}

run().catch(console.error);
