const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config({ path: 'c:/EngineeringTadka/ETMSN/.env' });
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-management';

const recipeCatalog = [
  // ================= 1. Sandwiches (Prepared in Sandwich Maker - Oil Free) =================
  {
    dishName: 'Chicken Sandwich',
    category: 'Sandwiches',
    appliance: 'Sandwich Maker',
    yieldPortions: 1,
    notes: 'Assemble with chicken & mayo, toast in Sandwich Maker with butter. 0 cooking oil.',
    ingredients: [
      { name: 'Jumbo Sandwich Bread', quantity: 0.2, unit: 'pkts' },
      { name: 'CHICKEN', quantity: 0.07, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.02, unit: 'kg' },
      { name: 'Amul Butter', quantity: 0.01, unit: 'kg' },
      { name: 'Sandwich Packaging Box', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Chicken Cheese Sandwich',
    category: 'Sandwiches',
    appliance: 'Sandwich Maker',
    yieldPortions: 1,
    notes: 'Layer seasoned chicken and shredded cheese. Grill in Sandwich Maker with butter.',
    ingredients: [
      { name: 'Jumbo Sandwich Bread', quantity: 0.2, unit: 'pkts' },
      { name: 'CHICKEN', quantity: 0.07, unit: 'kg' },
      { name: 'Blend Shredded Cheese', quantity: 0.025, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.02, unit: 'kg' },
      { name: 'Amul Butter', quantity: 0.01, unit: 'kg' },
      { name: 'Sandwich Packaging Box', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Grilled Chicken Sandwich',
    category: 'Sandwiches',
    appliance: 'Sandwich Maker',
    yieldPortions: 1,
    notes: 'Crispy grilled sandwich with chicken filling, grilled in Sandwich Maker.',
    ingredients: [
      { name: 'Jumbo Sandwich Bread', quantity: 0.2, unit: 'pkts' },
      { name: 'CHICKEN', quantity: 0.07, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.02, unit: 'kg' },
      { name: 'Amul Butter', quantity: 0.015, unit: 'kg' },
      { name: 'Sandwich Packaging Box', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Grilled Cheese Chicken Sandwich',
    category: 'Sandwiches',
    appliance: 'Sandwich Maker',
    yieldPortions: 1,
    notes: 'Overloaded cheese and spiced chicken, golden grilled in Sandwich Maker.',
    ingredients: [
      { name: 'Jumbo Sandwich Bread', quantity: 0.2, unit: 'pkts' },
      { name: 'CHICKEN', quantity: 0.07, unit: 'kg' },
      { name: 'Blend Shredded Cheese', quantity: 0.03, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.02, unit: 'kg' },
      { name: 'Amul Butter', quantity: 0.015, unit: 'kg' },
      { name: 'Sandwich Packaging Box', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Paneer Sandwich',
    category: 'Sandwiches',
    appliance: 'Sandwich Maker',
    yieldPortions: 1,
    notes: 'Fresh Warana malai paneer sandwich, toasted in Sandwich Maker.',
    ingredients: [
      { name: 'Jumbo Sandwich Bread', quantity: 0.2, unit: 'pkts' },
      { name: 'WARANA MALAI PANEER', quantity: 0.07, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.02, unit: 'kg' },
      { name: 'Amul Butter', quantity: 0.01, unit: 'kg' },
      { name: 'Sandwich Packaging Box', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Paneer Cheese Sandwich',
    category: 'Sandwiches',
    appliance: 'Sandwich Maker',
    yieldPortions: 1,
    notes: 'Soft paneer cubes with cheese blend toasted in Sandwich Maker.',
    ingredients: [
      { name: 'Jumbo Sandwich Bread', quantity: 0.2, unit: 'pkts' },
      { name: 'WARANA MALAI PANEER', quantity: 0.07, unit: 'kg' },
      { name: 'Blend Shredded Cheese', quantity: 0.025, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.02, unit: 'kg' },
      { name: 'Amul Butter', quantity: 0.01, unit: 'kg' },
      { name: 'Sandwich Packaging Box', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Grilled Paneer Sandwich',
    category: 'Sandwiches',
    appliance: 'Sandwich Maker',
    yieldPortions: 1,
    notes: 'Spiced paneer filling grilled to golden crisp in Sandwich Maker.',
    ingredients: [
      { name: 'Jumbo Sandwich Bread', quantity: 0.2, unit: 'pkts' },
      { name: 'WARANA MALAI PANEER', quantity: 0.07, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.02, unit: 'kg' },
      { name: 'Amul Butter', quantity: 0.015, unit: 'kg' },
      { name: 'Sandwich Packaging Box', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Grilled Paneer Cheese Sandwich',
    category: 'Sandwiches',
    appliance: 'Sandwich Maker',
    yieldPortions: 1,
    notes: 'Double layered paneer and rich mozzarella cheese, grilled in Sandwich Maker.',
    ingredients: [
      { name: 'Jumbo Sandwich Bread', quantity: 0.2, unit: 'pkts' },
      { name: 'WARANA MALAI PANEER', quantity: 0.07, unit: 'kg' },
      { name: 'Blend Shredded Cheese', quantity: 0.03, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.02, unit: 'kg' },
      { name: 'Amul Butter', quantity: 0.015, unit: 'kg' },
      { name: 'Sandwich Packaging Box', quantity: 1, unit: 'pcs' }
    ]
  },

  // ================= 2. Shawarmas (Microwave / Assembly - Oil Free) =================
  {
    dishName: 'Chicken Shawarma',
    category: 'Shawarma',
    appliance: 'Microwave',
    yieldPortions: 1,
    notes: 'Warm kubbos in microwave for 15 secs, roll with garlic mayo and seasoned chicken.',
    ingredients: [
      { name: 'Kubbos / Pita Flatbread', quantity: 1, unit: 'pcs' },
      { name: 'CHICKEN', quantity: 0.08, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.025, unit: 'kg' },
      { name: 'Shawarma Foil Wrap', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Cheesy Chicken Shawarma',
    category: 'Shawarma',
    appliance: 'Microwave',
    yieldPortions: 1,
    notes: 'Warm kubbos, fill with chicken, melted shredded cheese and garlic mayo.',
    ingredients: [
      { name: 'Kubbos / Pita Flatbread', quantity: 1, unit: 'pcs' },
      { name: 'CHICKEN', quantity: 0.08, unit: 'kg' },
      { name: 'Blend Shredded Cheese', quantity: 0.025, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.025, unit: 'kg' },
      { name: 'Shawarma Foil Wrap', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Hariyali Chicken Shawarma',
    category: 'Shawarma',
    appliance: 'Microwave',
    yieldPortions: 1,
    notes: 'Chicken tossed with fresh mint chutney rolled in warm flatbread.',
    ingredients: [
      { name: 'Kubbos / Pita Flatbread', quantity: 1, unit: 'pcs' },
      { name: 'CHICKEN', quantity: 0.08, unit: 'kg' },
      { name: 'Mint Chutney', quantity: 0.02, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.02, unit: 'kg' },
      { name: 'Shawarma Foil Wrap', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Peri Peri Chicken Shawarma',
    category: 'Shawarma',
    appliance: 'Microwave',
    yieldPortions: 1,
    notes: 'Fiery peri-peri spiced chicken shawarma wrap.',
    ingredients: [
      { name: 'Kubbos / Pita Flatbread', quantity: 1, unit: 'pcs' },
      { name: 'CHICKEN', quantity: 0.08, unit: 'kg' },
      { name: 'Peri Peri Seasoning', quantity: 0.01, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.025, unit: 'kg' },
      { name: 'Shawarma Foil Wrap', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Malai Chicken Shawarma',
    category: 'Shawarma',
    appliance: 'Microwave',
    yieldPortions: 1,
    notes: 'Creamy rich malai chicken with extra garlic mayonnaise in warm kubbos.',
    ingredients: [
      { name: 'Kubbos / Pita Flatbread', quantity: 1, unit: 'pcs' },
      { name: 'CHICKEN', quantity: 0.08, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.035, unit: 'kg' },
      { name: 'Shawarma Foil Wrap', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Paneer Shawarma',
    category: 'Shawarma',
    appliance: 'Microwave',
    yieldPortions: 1,
    notes: 'Spiced paneer cubes rolled in warm flatbread with garlic mayo.',
    ingredients: [
      { name: 'Kubbos / Pita Flatbread', quantity: 1, unit: 'pcs' },
      { name: 'WARANA MALAI PANEER', quantity: 0.08, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.025, unit: 'kg' },
      { name: 'Shawarma Foil Wrap', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Cheesy Paneer Shawarma',
    category: 'Shawarma',
    appliance: 'Microwave',
    yieldPortions: 1,
    notes: 'Warm kubbos with spiced paneer, melted cheese and garlic mayo.',
    ingredients: [
      { name: 'Kubbos / Pita Flatbread', quantity: 1, unit: 'pcs' },
      { name: 'WARANA MALAI PANEER', quantity: 0.08, unit: 'kg' },
      { name: 'Blend Shredded Cheese', quantity: 0.025, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.025, unit: 'kg' },
      { name: 'Shawarma Foil Wrap', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Hariyali Paneer Shawarma',
    category: 'Shawarma',
    appliance: 'Microwave',
    yieldPortions: 1,
    notes: 'Mint and coriander spiced paneer wrap.',
    ingredients: [
      { name: 'Kubbos / Pita Flatbread', quantity: 1, unit: 'pcs' },
      { name: 'WARANA MALAI PANEER', quantity: 0.08, unit: 'kg' },
      { name: 'Mint Chutney', quantity: 0.02, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.02, unit: 'kg' },
      { name: 'Shawarma Foil Wrap', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Peri Peri Paneer Shawarma',
    category: 'Shawarma',
    appliance: 'Microwave',
    yieldPortions: 1,
    notes: 'Fiery peri-peri spiced cottage cheese shawarma wrap.',
    ingredients: [
      { name: 'Kubbos / Pita Flatbread', quantity: 1, unit: 'pcs' },
      { name: 'WARANA MALAI PANEER', quantity: 0.08, unit: 'kg' },
      { name: 'Peri Peri Seasoning', quantity: 0.01, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.025, unit: 'kg' },
      { name: 'Shawarma Foil Wrap', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Malai Paneer Shawarma',
    category: 'Shawarma',
    appliance: 'Microwave',
    yieldPortions: 1,
    notes: 'Extra creamy malai paneer wrap with rich garlic mayonnaise.',
    ingredients: [
      { name: 'Kubbos / Pita Flatbread', quantity: 1, unit: 'pcs' },
      { name: 'WARANA MALAI PANEER', quantity: 0.08, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.035, unit: 'kg' },
      { name: 'Shawarma Foil Wrap', quantity: 1, unit: 'pcs' }
    ]
  },

  // ================= 3. Sides & Starters (Air Fryer - 100% Oil Free) =================
  {
    dishName: 'Dahi Kebab (6pc)',
    category: 'Sides',
    appliance: 'Air Fryer',
    yieldPortions: 1,
    notes: 'Air-fry at 180°C for 8-10 mins. 100% Oil-Free using Hung Curd (Dahi) & Fresh Warana Paneer.',
    ingredients: [
      { name: 'Hung Curd (Dahi)', quantity: 0.10, unit: 'kg' },
      { name: 'WARANA MALAI PANEER', quantity: 0.05, unit: 'kg' },
      { name: 'Starter / Fries Serving Box', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Paneer Tikka (6pc)',
    category: 'Sides',
    appliance: 'Air Fryer',
    yieldPortions: 1,
    notes: 'Marinate fresh paneer in tikka spices, air fry at 200°C for 8 mins with light butter brush.',
    ingredients: [
      { name: 'WARANA MALAI PANEER', quantity: 0.15, unit: 'kg' },
      { name: 'Tikka Marinade Masala', quantity: 0.025, unit: 'kg' },
      { name: 'Amul Butter', quantity: 0.01, unit: 'kg' },
      { name: 'Starter / Fries Serving Box', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Chicken Drumstick (2pc)',
    category: 'Sides',
    appliance: 'Air Fryer',
    yieldPortions: 1,
    notes: 'Air-fry chicken drumsticks at 190°C for 15 mins until golden and crispy.',
    ingredients: [
      { name: 'Chicken Drumsticks', quantity: 2, unit: 'pcs' },
      { name: 'Tikka Marinade Masala', quantity: 0.02, unit: 'kg' },
      { name: 'Starter / Fries Serving Box', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'French Fries',
    category: 'Sides',
    appliance: 'Air Fryer',
    yieldPortions: 1,
    notes: 'Air-fry frozen fries for 12 mins at 200°C. 0 cooking oil.',
    ingredients: [
      { name: 'Frozen Potato French Fries', quantity: 0.15, unit: 'kg' },
      { name: 'Starter / Fries Serving Box', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Peri Peri French Fries',
    category: 'Sides',
    appliance: 'Air Fryer',
    yieldPortions: 1,
    notes: 'Air-fry fries (0 oil), toss with spicy peri peri seasoning.',
    ingredients: [
      { name: 'Frozen Potato French Fries', quantity: 0.15, unit: 'kg' },
      { name: 'Peri Peri Seasoning', quantity: 0.01, unit: 'kg' },
      { name: 'Starter / Fries Serving Box', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Cheesy French Fries',
    category: 'Sides',
    appliance: 'Air Fryer',
    yieldPortions: 1,
    notes: 'Crispy air-fried fries topped with melted shredded cheese blend.',
    ingredients: [
      { name: 'Frozen Potato French Fries', quantity: 0.15, unit: 'kg' },
      { name: 'Blend Shredded Cheese', quantity: 0.03, unit: 'kg' },
      { name: 'Starter / Fries Serving Box', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Chicken Shev Puri',
    category: 'Sides',
    appliance: 'Assembly',
    yieldPortions: 1,
    notes: 'Assemble crisp papdis with chicken, nylon shev, mint and sweet tamarind chutneys.',
    ingredients: [
      { name: 'Papdi Puri', quantity: 0.2, unit: 'pkts' },
      { name: 'CHICKEN', quantity: 0.06, unit: 'kg' },
      { name: 'Nylon Shev', quantity: 0.015, unit: 'kg' },
      { name: 'Mint Chutney', quantity: 0.015, unit: 'kg' },
      { name: 'Tamarind Sweet Chutney', quantity: 0.015, unit: 'kg' },
      { name: 'Starter / Fries Serving Box', quantity: 1, unit: 'pcs' }
    ]
  },

  // ================= 4. Mains (Induction Cooktop) =================
  {
    dishName: 'Chicken Dum Biryani',
    category: 'Main Course',
    appliance: 'Induction',
    yieldPortions: 1,
    notes: 'Cook on Induction with basmati rice, spiced chicken, desi ghee and cooking oil.',
    ingredients: [
      { name: 'Basmati Biryani Rice', quantity: 0.18, unit: 'kg' },
      { name: 'CHICKEN', quantity: 0.18, unit: 'kg' },
      { name: 'Biryani Spice Mix', quantity: 0.03, unit: 'kg' },
      { name: 'Desi Ghee', quantity: 0.015, unit: 'litres' },
      { name: 'Cooking Oil', quantity: 0.015, unit: 'litres' },
      { name: 'Biryani Container 750ml', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Masala Maggi',
    category: 'Main Course',
    appliance: 'Induction',
    yieldPortions: 1,
    notes: 'Boil on Induction with tastemaker and butter.',
    ingredients: [
      { name: 'Maggi Noodles (Pack)', quantity: 1, unit: 'pkts' },
      { name: 'Amul Butter', quantity: 0.01, unit: 'kg' },
      { name: 'Starter / Fries Serving Box', quantity: 1, unit: 'pcs' }
    ]
  },

  // ================= 5. Beverages (Mixer & Induction) =================
  {
    dishName: 'Tea',
    category: 'Beverages',
    appliance: 'Induction',
    yieldPortions: 1,
    notes: 'Brew milk tea on induction with chai masala and sugar.',
    ingredients: [
      { name: 'Fresh Milk (Amul Taaza)', quantity: 0.12, unit: 'litres' },
      { name: 'Tea Leaves & Chai Masala', quantity: 0.006, unit: 'kg' },
      { name: 'Sugar', quantity: 0.015, unit: 'kg' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Hot Coffee',
    category: 'Beverages',
    appliance: 'Induction',
    yieldPortions: 1,
    notes: 'Brew fresh espresso coffee with steamed milk on induction.',
    ingredients: [
      { name: 'Fresh Milk (Amul Taaza)', quantity: 0.15, unit: 'litres' },
      { name: 'Espresso Coffee Powder', quantity: 0.006, unit: 'kg' },
      { name: 'Sugar', quantity: 0.015, unit: 'kg' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Cold Coffee',
    category: 'Beverages',
    appliance: 'Mixer',
    yieldPortions: 1,
    notes: 'Blend chilled milk, espresso powder, cocoa and sugar in Mixer until frothy.',
    ingredients: [
      { name: 'Fresh Milk (Amul Taaza)', quantity: 0.22, unit: 'litres' },
      { name: 'Espresso Coffee Powder', quantity: 0.008, unit: 'kg' },
      { name: 'Sugar', quantity: 0.02, unit: 'kg' },
      { name: 'Cocoa & Chocolate Powder', quantity: 0.005, unit: 'kg' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Caffe Mocha',
    category: 'Beverages',
    appliance: 'Mixer',
    yieldPortions: 1,
    notes: 'Blend milk, espresso and rich chocolate syrup in Mixer.',
    ingredients: [
      { name: 'Fresh Milk (Amul Taaza)', quantity: 0.22, unit: 'litres' },
      { name: 'Espresso Coffee Powder', quantity: 0.008, unit: 'kg' },
      { name: 'Chocolate Syrup', quantity: 0.02, unit: 'litres' },
      { name: 'Sugar', quantity: 0.015, unit: 'kg' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Chocolate Milkshake',
    category: 'Beverages',
    appliance: 'Mixer',
    yieldPortions: 1,
    notes: 'Thick blended chocolate shake made in Mixer.',
    ingredients: [
      { name: 'Fresh Milk (Amul Taaza)', quantity: 0.22, unit: 'litres' },
      { name: 'Chocolate Syrup', quantity: 0.035, unit: 'litres' },
      { name: 'Sugar', quantity: 0.015, unit: 'kg' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Strawberry Milk Shake',
    category: 'Beverages',
    appliance: 'Mixer',
    yieldPortions: 1,
    notes: 'Blend chilled milk with strawberry fruit crush in Mixer.',
    ingredients: [
      { name: 'Fresh Milk (Amul Taaza)', quantity: 0.22, unit: 'litres' },
      { name: 'Strawberry Fruit Crush', quantity: 0.035, unit: 'litres' },
      { name: 'Sugar', quantity: 0.015, unit: 'kg' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Mango Milk Shake',
    category: 'Beverages',
    appliance: 'Mixer',
    yieldPortions: 1,
    notes: 'Blend fresh milk with rich Alphonso mango pulp in Mixer.',
    ingredients: [
      { name: 'Fresh Milk (Amul Taaza)', quantity: 0.22, unit: 'litres' },
      { name: 'Alphonso Mango Pulp', quantity: 0.04, unit: 'litres' },
      { name: 'Sugar', quantity: 0.015, unit: 'kg' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Lemon Mojito',
    category: 'Beverages',
    appliance: 'Mixer',
    yieldPortions: 1,
    notes: 'Fresh lemon juice, mint syrup, sugar, topped with sparkling club soda.',
    ingredients: [
      { name: 'Fresh Lemons', quantity: 1, unit: 'pcs' },
      { name: 'Mojito Mint Syrup', quantity: 0.03, unit: 'litres' },
      { name: 'Sugar', quantity: 0.015, unit: 'kg' },
      { name: 'Club Soda', quantity: 1, unit: 'cans' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Cold Drinks',
    category: 'Beverages',
    appliance: 'Assembly',
    yieldPortions: 1,
    notes: 'Chilled soft drink served with cup.',
    ingredients: [
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Diet Coke',
    category: 'Beverages',
    appliance: 'Assembly',
    yieldPortions: 1,
    notes: 'Serve chilled Diet Coke can with cup and paper straw.',
    ingredients: [
      { name: 'Diet Coke Can 300ml', quantity: 1, unit: 'cans' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Thums Up',
    category: 'Beverages',
    appliance: 'Assembly',
    yieldPortions: 1,
    notes: 'Serve chilled Thums Up can with cup and paper straw.',
    ingredients: [
      { name: 'Thums Up Can 300ml', quantity: 1, unit: 'cans' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Sprite',
    category: 'Beverages',
    appliance: 'Assembly',
    yieldPortions: 1,
    notes: 'Serve chilled Sprite can with cup and paper straw.',
    ingredients: [
      { name: 'Sprite Can 300ml', quantity: 1, unit: 'cans' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Frooti',
    category: 'Beverages',
    appliance: 'Assembly',
    yieldPortions: 1,
    notes: 'Serve packaged Frooti pack with straw.',
    ingredients: [
      { name: 'Frooti 150ml', quantity: 1, unit: 'pkts' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Water',
    category: 'Beverages',
    appliance: 'Assembly',
    yieldPortions: 1,
    notes: 'Serve sealed packaged mineral water bottle.',
    ingredients: [
      { name: 'Packaged Water Bottle 500ml', quantity: 1, unit: 'pcs' }
    ]
  },

  // ================= 6. Value Pre-set Combos =================
  {
    dishName: 'Combo 1: Sandwich + Fries + Milk Shake',
    category: 'Combos',
    appliance: 'Sandwich Maker',
    yieldPortions: 1,
    notes: 'Grilled Sandwich in Sandwich Maker + Air-fried Fries + Chocolate Milk Shake in Mixer.',
    ingredients: [
      { name: 'Jumbo Sandwich Bread', quantity: 0.2, unit: 'pkts' },
      { name: 'CHICKEN', quantity: 0.07, unit: 'kg' },
      { name: 'Frozen Potato French Fries', quantity: 0.15, unit: 'kg' },
      { name: 'Fresh Milk (Amul Taaza)', quantity: 0.22, unit: 'litres' },
      { name: 'Chocolate Syrup', quantity: 0.035, unit: 'litres' },
      { name: 'Amul Butter', quantity: 0.01, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.02, unit: 'kg' },
      { name: 'Sugar', quantity: 0.015, unit: 'kg' },
      { name: 'Sandwich Packaging Box', quantity: 1, unit: 'pcs' },
      { name: 'Starter / Fries Serving Box', quantity: 1, unit: 'pcs' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Combo 2: Sandwich + Cold Coffee',
    category: 'Combos',
    appliance: 'Sandwich Maker',
    yieldPortions: 1,
    notes: 'Toasted Sandwich in Sandwich Maker + Frothy Cold Coffee in Mixer.',
    ingredients: [
      { name: 'Jumbo Sandwich Bread', quantity: 0.2, unit: 'pkts' },
      { name: 'CHICKEN', quantity: 0.07, unit: 'kg' },
      { name: 'Fresh Milk (Amul Taaza)', quantity: 0.22, unit: 'litres' },
      { name: 'Espresso Coffee Powder', quantity: 0.008, unit: 'kg' },
      { name: 'Amul Butter', quantity: 0.01, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.02, unit: 'kg' },
      { name: 'Sugar', quantity: 0.02, unit: 'kg' },
      { name: 'Sandwich Packaging Box', quantity: 1, unit: 'pcs' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Combo 3: Sandwich + Tea + Fries',
    category: 'Combos',
    appliance: 'Sandwich Maker',
    yieldPortions: 1,
    notes: 'Sandwich in Sandwich Maker + Masala Tea on Induction + Air-fried Fries.',
    ingredients: [
      { name: 'Jumbo Sandwich Bread', quantity: 0.2, unit: 'pkts' },
      { name: 'CHICKEN', quantity: 0.07, unit: 'kg' },
      { name: 'Frozen Potato French Fries', quantity: 0.15, unit: 'kg' },
      { name: 'Fresh Milk (Amul Taaza)', quantity: 0.12, unit: 'litres' },
      { name: 'Tea Leaves & Chai Masala', quantity: 0.006, unit: 'kg' },
      { name: 'Amul Butter', quantity: 0.01, unit: 'kg' },
      { name: 'Garlic Eggless Mayonnaise', quantity: 0.02, unit: 'kg' },
      { name: 'Sugar', quantity: 0.015, unit: 'kg' },
      { name: 'Sandwich Packaging Box', quantity: 1, unit: 'pcs' },
      { name: 'Starter / Fries Serving Box', quantity: 1, unit: 'pcs' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Combo 4: Biryani + Coke',
    category: 'Combos',
    appliance: 'Induction',
    yieldPortions: 1,
    notes: 'Aromatic Chicken Dum Biryani with Ghee & Oil + Chilled Diet Coke Can.',
    ingredients: [
      { name: 'Basmati Biryani Rice', quantity: 0.18, unit: 'kg' },
      { name: 'CHICKEN', quantity: 0.18, unit: 'kg' },
      { name: 'Biryani Spice Mix', quantity: 0.03, unit: 'kg' },
      { name: 'Desi Ghee', quantity: 0.015, unit: 'litres' },
      { name: 'Cooking Oil', quantity: 0.015, unit: 'litres' },
      { name: 'Diet Coke Can 300ml', quantity: 1, unit: 'cans' },
      { name: 'Biryani Container 750ml', quantity: 1, unit: 'pcs' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Combo 5: Chicken Drumstick (2pc) + Fries + Milk Shake',
    category: 'Combos',
    appliance: 'Air Fryer',
    yieldPortions: 1,
    notes: 'Air-fried Drumsticks (2pc) & Fries (0 oil) + Blended Chocolate Shake.',
    ingredients: [
      { name: 'Chicken Drumsticks', quantity: 2, unit: 'pcs' },
      { name: 'Frozen Potato French Fries', quantity: 0.15, unit: 'kg' },
      { name: 'Fresh Milk (Amul Taaza)', quantity: 0.22, unit: 'litres' },
      { name: 'Chocolate Syrup', quantity: 0.035, unit: 'litres' },
      { name: 'Sugar', quantity: 0.015, unit: 'kg' },
      { name: 'Tikka Marinade Masala', quantity: 0.02, unit: 'kg' },
      { name: 'Starter / Fries Serving Box', quantity: 2, unit: 'pcs' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  },
  {
    dishName: 'Tadka Special: Drum Stick (1pc) + Paneer Tikka (2pc) + Dahi Kebab (2pc) + Milk Shake',
    category: 'Combos',
    appliance: 'Air Fryer',
    yieldPortions: 1,
    notes: 'Platter with Drumstick, Paneer Tikka, Dahi Kebab (Dahi+Paneer) in Air Fryer + Strawberry Shake.',
    ingredients: [
      { name: 'Chicken Drumsticks', quantity: 1, unit: 'pcs' },
      { name: 'WARANA MALAI PANEER', quantity: 0.06, unit: 'kg' },
      { name: 'Hung Curd (Dahi)', quantity: 0.04, unit: 'kg' },
      { name: 'Fresh Milk (Amul Taaza)', quantity: 0.22, unit: 'litres' },
      { name: 'Strawberry Fruit Crush', quantity: 0.035, unit: 'litres' },
      { name: 'Sugar', quantity: 0.015, unit: 'kg' },
      { name: 'Tikka Marinade Masala', quantity: 0.015, unit: 'kg' },
      { name: 'Starter / Fries Serving Box', quantity: 2, unit: 'pcs' },
      { name: 'Beverage Cups & Glasses', quantity: 1, unit: 'pcs' },
      { name: 'Paper Straws', quantity: 1, unit: 'pcs' }
    ]
  }
];

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB:", uri);

    const RestaurantSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      name: { type: String, required: true }
    }, { collection: 'restaurants', strict: false });

    const FoodItemSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      restaurantId: { type: String, required: true },
      name: { type: String, required: true }
    }, { collection: 'fooditems', strict: false });

    const InventorySchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      restaurantId: { type: String, required: true },
      name: { type: String, required: true },
      unit: { type: String, default: 'units' }
    }, { collection: 'inventories', strict: false });

    const RecipeSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      restaurantId: { type: String, required: true },
      dishName: { type: String, required: true },
      dishId: { type: String },
      category: { type: String },
      appliance: { type: String, default: 'Assembly' },
      yieldPortions: { type: Number, default: 1 },
      ingredients: [{
        inventoryItemId: { type: String, required: true },
        inventoryItemName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, default: 'units' }
      }],
      notes: { type: String },
      isActive: { type: Boolean, default: true }
    }, { collection: 'recipes', timestamps: true });

    const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);
    const FoodItem = mongoose.models.FoodItem || mongoose.model('FoodItem', FoodItemSchema);
    const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
    const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema);

    const restaurants = await Restaurant.find({});
    let restIds = restaurants.map(r => r.id);
    if (restIds.length === 0) restIds = ['default-restaurant-id'];

    console.log("Seeding recipes for restaurants:", restIds);

    for (const restId of restIds) {
      const invItems = await Inventory.find({ restaurantId: restId });
      const foodItems = await FoodItem.find({ restaurantId: restId });

      for (const rDef of recipeCatalog) {
        const matchingFood = foodItems.find(f => f.name.toLowerCase() === rDef.dishName.toLowerCase());
        const mappedIngredients = [];

        for (const ing of rDef.ingredients) {
          const inv = invItems.find(i => i.name.toLowerCase() === ing.name.toLowerCase());
          if (inv) {
            mappedIngredients.push({
              inventoryItemId: inv.id,
              inventoryItemName: inv.name,
              quantity: ing.quantity,
              unit: inv.unit || ing.unit
            });
          } else {
            console.warn(`⚠️ Warning: Inventory item "${ing.name}" not found for recipe "${rDef.dishName}"`);
          }
        }

        const existingRecipe = await Recipe.findOne({
          restaurantId: restId,
          dishName: { $regex: new RegExp(`^${rDef.dishName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
        });

        if (existingRecipe) {
          existingRecipe.dishId = matchingFood ? matchingFood.id : existingRecipe.dishId;
          existingRecipe.category = rDef.category;
          existingRecipe.appliance = rDef.appliance;
          existingRecipe.yieldPortions = rDef.yieldPortions || 1;
          existingRecipe.ingredients = mappedIngredients;
          existingRecipe.notes = rDef.notes;
          existingRecipe.isActive = true;
          await existingRecipe.save();
          console.log(`Updated recipe: ${existingRecipe.dishName} [${existingRecipe.appliance}] (${mappedIngredients.length} ingredients)`);
        } else {
          const newRecipe = new Recipe({
            id: uuidv4(),
            restaurantId: restId,
            dishName: rDef.dishName,
            dishId: matchingFood ? matchingFood.id : null,
            category: rDef.category,
            appliance: rDef.appliance,
            yieldPortions: rDef.yieldPortions || 1,
            ingredients: mappedIngredients,
            notes: rDef.notes,
            isActive: true
          });
          await newRecipe.save();
          console.log(`Created recipe: ${newRecipe.dishName} [${newRecipe.appliance}] (${mappedIngredients.length} ingredients)`);
        }
      }
    }

    console.log("✅ Successfully seeded all 47 recipes into MongoDB!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding recipes:", err);
    process.exit(1);
  }
}

run();
