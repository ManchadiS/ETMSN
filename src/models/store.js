// Simple store with optional MongoDB persistence via mongoose
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const useDb = process.env.USE_DB === 'true';

let Restaurant, FoodItem, Expense, Billing, User, Inventory, Order, Customer, Role, PurchaseBill, Payout, Wastage, Recipe, InventoryDeduction, BankTransaction;

if (useDb) {
  const mongoose = require('mongoose');
  const { connect } = require('../db/mongodb');

  connect().then(async () => {
    try {
      // Wait for models to be compiled
      const roleCount = await Role.countDocuments({});
      if (roleCount === 0) {
        const superAdminRole = new Role({
          id: 'super-admin-role-id',
          name: 'Super Admin',
          sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'create-order', 'expenses', 'inventory', 'recipes', 'billing', 'users', 'system-status', 'payouts', 'wastage', 'reports'],
          deleteAccess: true
        });
        const adminRole = new Role({
          id: 'admin-role-id',
          name: 'Admin',
          sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'create-order', 'expenses', 'inventory', 'recipes', 'billing', 'payouts', 'wastage', 'reports'],
          deleteAccess: false
        });
        await superAdminRole.save();
        await adminRole.save();
        console.log('✅ Seeded default Roles in MongoDB: Super Admin, Admin');
      }

      const superAdminUser = await User.findOne({ email: 'sagarmanchadi324@gmail.com' });
      const adminPasswordHash = crypto.createHash('sha256').update('sagar@2410').digest('hex');
      if (!superAdminUser) {
        const defaultSuperAdmin = new User({
          id: 'sagar-super-admin-id',
          firstName: 'Sagar',
          lastName: 'Manchadi',
          email: 'sagarmanchadi324@gmail.com',
          password: adminPasswordHash,
          dob: '1995-01-01',
          age: 31,
          role: 'Super Admin'
        });
        await defaultSuperAdmin.save();
      } else {
        superAdminUser.password = adminPasswordHash;
        await superAdminUser.save();
      }

      const adminUser = await User.findOne({ email: 'admin@example.com' });
      if (!adminUser) {
        const adminPasswordHash = crypto.createHash('sha256').update('admin123').digest('hex');
        const defaultAdmin = new User({
          id: 'default-admin-id',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: adminPasswordHash,
          dob: '1990-01-01',
          age: 36,
          role: 'Admin'
        });
        await defaultAdmin.save();
        console.log('✅ Seeded default Admin user in MongoDB: admin@example.com / admin123');
      }

      const restCount = await Restaurant.countDocuments({});
      if (restCount === 0) {
        const defaultRest = new Restaurant({
          id: 'default-restaurant-id',
          name: 'Engineering Tadka Main Outlet',
          address: '123 Tech Park, Silicon Valley'
        });
        await defaultRest.save();
        console.log('✅ Seeded default restaurant in MongoDB');
      }

      const foodCount = await FoodItem.countDocuments({});
      if (foodCount === 0) {
        const defaultFoodItems = [
          // 1. Shawarma
          { id: 'item-1', name: 'Chicken Shawarma', price: 100, category: 'Shawarma', description: 'Grilled seasoned chicken rolled in warm flatbread', restaurantId: 'default-restaurant-id' },
          { id: 'item-2', name: 'Cheesy Chicken Shawarma', price: 130, category: 'Shawarma', description: 'Loaded with melted cheese and seasoned chicken', restaurantId: 'default-restaurant-id' },
          { id: 'item-3', name: 'Hariyali Chicken Shawarma', price: 120, category: 'Shawarma', description: 'Fresh mint and coriander herb spiced chicken wrap', restaurantId: 'default-restaurant-id' },
          { id: 'item-4', name: 'Peri Peri Chicken Shawarma', price: 120, category: 'Shawarma', description: 'Fiery peri-peri spiced chicken shawarma wrap', restaurantId: 'default-restaurant-id' },
          { id: 'item-5', name: 'Malai Chicken Shawarma', price: 150, category: 'Shawarma', description: 'Creamy rich malai chicken with mild spices', restaurantId: 'default-restaurant-id' },
          { id: 'item-6', name: 'Paneer Shawarma', price: 100, category: 'Shawarma', description: 'Fresh paneer cubes tossed in aromatic spices', restaurantId: 'default-restaurant-id' },
          { id: 'item-7', name: 'Cheesy Paneer Shawarma', price: 130, category: 'Shawarma', description: 'Gooey cheese blend over succulent paneer cubes', restaurantId: 'default-restaurant-id' },
          { id: 'item-8', name: 'Hariyali Paneer Shawarma', price: 120, category: 'Shawarma', description: 'Herbed green spiced paneer wrap', restaurantId: 'default-restaurant-id' },
          { id: 'item-9', name: 'Peri Peri Paneer Shawarma', price: 120, category: 'Shawarma', description: 'Spicy peri peri glazed soft paneer', restaurantId: 'default-restaurant-id' },
          { id: 'item-10', name: 'Malai Paneer Shawarma', price: 150, category: 'Shawarma', description: 'Rich creamy malai paneer rolled in bread', restaurantId: 'default-restaurant-id' },

          // 2. Sandwiches
          { id: 'item-11', name: 'Chicken Sandwich', price: 100, category: 'Sandwiches', description: 'Classic seasoned chicken slices with crisp veggies', restaurantId: 'default-restaurant-id' },
          { id: 'item-12', name: 'Chicken Cheese Sandwich', price: 130, category: 'Sandwiches', description: 'Seasoned chicken paired with melted cheese', restaurantId: 'default-restaurant-id' },
          { id: 'item-13', name: 'Grilled Chicken Sandwich', price: 120, category: 'Sandwiches', description: 'Golden grilled sandwich packed with chicken', restaurantId: 'default-restaurant-id' },
          { id: 'item-14', name: 'Grilled Cheese Chicken Sandwich', price: 140, category: 'Sandwiches', description: 'Double grilled sandwich loaded with chicken & gooey cheese', restaurantId: 'default-restaurant-id' },
          { id: 'item-15', name: 'Paneer Sandwich', price: 100, category: 'Sandwiches', description: 'Freshly seasoned paneer slices and crisp greens', restaurantId: 'default-restaurant-id' },
          { id: 'item-16', name: 'Paneer Cheese Sandwich', price: 130, category: 'Sandwiches', description: 'Paneer with melted cheddar and mozzarella cheese', restaurantId: 'default-restaurant-id' },
          { id: 'item-17', name: 'Grilled Paneer Sandwich', price: 120, category: 'Sandwiches', description: 'Toasted crisp bread layered with spiced paneer filling', restaurantId: 'default-restaurant-id' },
          { id: 'item-18', name: 'Grilled Paneer Cheese Sandwich', price: 140, category: 'Sandwiches', description: 'Grilled sandwich with paneer and overloaded melted cheese', restaurantId: 'default-restaurant-id' },

          // 3. Sides
          { id: 'item-19', name: 'Chicken Drumstick (2pc)', price: 280, category: 'Sides', description: 'Crispy deep-fried golden chicken drumsticks (2 pcs)', restaurantId: 'default-restaurant-id' },
          { id: 'item-20', name: 'Chicken Shev Puri', price: 120, category: 'Sides', description: 'Crisp puris stuffed with spiced chicken, chutneys and sev', restaurantId: 'default-restaurant-id' },
          { id: 'item-21', name: 'Dahi Kebab (6pc)', price: 150, category: 'Sides', description: 'Crisp creamy hung curd spiced kebabs (6 pcs)', restaurantId: 'default-restaurant-id' },
          { id: 'item-22', name: 'Paneer Tikka (6pc)', price: 220, category: 'Sides', description: 'Clay-oven charred spicy cottage cheese chunks (6 pcs)', restaurantId: 'default-restaurant-id' },
          { id: 'item-23', name: 'French Fries', price: 90, category: 'Sides', description: 'Crispy salted golden potato fries with dip', restaurantId: 'default-restaurant-id' },
          { id: 'item-24', name: 'Peri Peri French Fries', price: 120, category: 'Sides', description: 'Crispy french fries dusted with spicy peri peri seasoning', restaurantId: 'default-restaurant-id' },
          { id: 'item-25', name: 'Cheesy French Fries', price: 150, category: 'Sides', description: 'Golden fries drenched in warm melted cheese sauce', restaurantId: 'default-restaurant-id' },

          // 4. Mains
          { id: 'item-26', name: 'Chicken Dum Biryani', price: 200, category: 'Main Course', description: 'Slow-cooked aromatic basmati rice with tender spiced chicken', restaurantId: 'default-restaurant-id' },
          { id: 'item-27', name: 'Masala Maggi', price: 80, category: 'Main Course', description: 'Street style spiced instant noodles cooked with veggies', restaurantId: 'default-restaurant-id' },

          // 5. Drinks
          { id: 'item-28', name: 'Tea', price: 30, category: 'Beverages', description: 'Traditional Indian masala milk chai served hot', restaurantId: 'default-restaurant-id' },
          { id: 'item-29', name: 'Hot Coffee', price: 40, category: 'Beverages', description: 'Freshly brewed rich hot espresso coffee', restaurantId: 'default-restaurant-id' },
          { id: 'item-30', name: 'Cold Coffee', price: 100, category: 'Beverages', description: 'Chilled blended creamy coffee topped with chocolate powder', restaurantId: 'default-restaurant-id' },
          { id: 'item-31', name: 'Caffe Mocha', price: 160, category: 'Beverages', description: 'Espresso with rich chocolate, steamed milk and whipped cream', restaurantId: 'default-restaurant-id' },
          { id: 'item-32', name: 'Chocolate Milkshake', price: 130, category: 'Beverages', description: 'Thick and decadent chocolate milkshake with whipped topping', restaurantId: 'default-restaurant-id' },
          { id: 'item-33', name: 'Strawberry Milk Shake', price: 130, category: 'Beverages', description: 'Luscious pink strawberry milkshake with real fruit essence', restaurantId: 'default-restaurant-id' },
          { id: 'item-34', name: 'Mango Milk Shake', price: 130, category: 'Beverages', description: 'Thick creamy mango shake made from juicy Alphonso pulp', restaurantId: 'default-restaurant-id' },
          { id: 'item-35', name: 'Lemon Mojito', price: 80, category: 'Beverages', description: 'Sparkling mint and zesty fresh lime refresher over ice', restaurantId: 'default-restaurant-id' },
          { id: 'item-36', name: 'Cold Drinks', price: 20, category: 'Beverages', description: 'Assorted soft drinks (MRP)', restaurantId: 'default-restaurant-id' },
          { id: 'item-37', name: 'Diet Coke', price: 50, category: 'Beverages', description: 'Cold Coca-Cola can', restaurantId: 'default-restaurant-id' },
          { id: 'item-38', name: 'Thums Up', price: 40, category: 'Beverages', description: 'Cold Thums Up can', restaurantId: 'default-restaurant-id' },
          { id: 'item-39', name: 'Sprite', price: 40, category: 'Beverages', description: 'Cold Sprite can', restaurantId: 'default-restaurant-id' },
          { id: 'item-40', name: 'Frooti', price: 10, category: 'Beverages', description: 'Frooti Mango Drink', restaurantId: 'default-restaurant-id' },
          { id: 'item-41', name: 'Water', price: 10, category: 'Beverages', description: 'Packaged mineral water bottle', restaurantId: 'default-restaurant-id' }
        ];
        for (const itemData of defaultFoodItems) {
          const item = new FoodItem(itemData);
          await item.save();
        }
        console.log('✅ Seeded default food items in MongoDB');
      }
    } catch (err) {
      console.error('Error seeding MongoDB:', err);
    }
  }).catch(err => {
    console.error('MongoDB Connection Error:', err);
  });

  // Define Mongoose Schemas
  const RestaurantSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    address: { type: String },
    gstin: { type: String },
    legalName: { type: String },
    tradeName: { type: String },
    state: { type: String },
    stateCode: { type: String },
    filingFrequency: { type: String, default: 'monthly' },
    defaultGstScheme: { type: String, default: 'restaurant_5_no_itc' }
  }, { timestamps: true, id: false });

  const FoodItemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String },
    active: { type: Boolean, default: true },
    isVeg: { type: Boolean },
    foodType: { type: String, enum: ['veg', 'non-veg'] }
  }, { timestamps: true, id: false });

  const ExpenseSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: String },
    category: { type: String },
    imageUrl: { type: String },
    createdBy: { type: String },
    updatedBy: { type: String }
  }, { timestamps: true, id: false });

  const BillingSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    restaurantId: { type: String, required: true },
    date: { type: String },
    description: { type: String },
    status: { type: String, default: 'pending' },
    mobile: { type: String },
    emailId: { type: String },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    foodItems: { type: Array, default: [] },
    orderNumber: { type: Number },
    discount: { type: Number, default: 0 },
    paymentMode: { type: String, default: 'Cash' },
    orderType: { type: String, default: 'dinein' },
    cashAmount: { type: Number, default: 0 },
    upiAmount: { type: Number, default: 0 },
    customerGstin: { type: String },
    isB2B: { type: Boolean, default: false }
  }, { timestamps: true, id: false });

  const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: String, required: true },
    age: { type: Number, required: true },
    role: { type: String, default: 'Admin' }
  }, { timestamps: true, id: false });

  const RoleSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    sidebarAccess: { type: [String], default: [] },
    deleteAccess: { type: Boolean, default: false }
  }, { timestamps: true, id: false });

  const InventorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'units' },
    threshold: { type: Number, default: 10 }
  }, { timestamps: true, id: false });

  const OrderSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    tableNo: { type: String },
    items: { type: Array, default: [] },
    status: { type: String, default: 'received' },
    totalAmount: { type: Number, required: true },
    date: { type: String },
    mobile: { type: String },
    emailId: { type: String },
    orderNumber: { type: Number },
    discount: { type: Number, default: 0 },
    orderType: { type: String, default: 'dinein' },
    paymentMode: { type: String, default: 'Cash' },
    paymentStatus: { type: String, default: 'pending' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    cashAmount: { type: Number, default: 0 },
    upiAmount: { type: Number, default: 0 }
  }, { timestamps: true, id: false });

  const CustomerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    mobile: { type: String, unique: true, sparse: true },
    emailId: { type: String, sparse: true },
    loyaltyPoints: { type: Number, default: 0 },
    lastLoyaltyActivity: { type: Date, default: Date.now }
  }, { timestamps: true, id: false });

  const PurchaseBillSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    supplierName: { type: String, required: true },
    supplierGstin: { type: String },
    billNumber: { type: String },
    date: { type: String },
    items: { type: Array, default: [] },
    totalAmount: { type: Number, required: true },
    taxableAmount: { type: Number },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    isItcEligible: { type: Boolean, default: false },
    reverseCharge: { type: Boolean, default: false },
    paymentMode: { type: String, default: 'Cash' },
    status: { type: String, default: 'paid' }
  }, { timestamps: true, id: false });

  const PayoutSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    platform: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    referenceNumber: { type: String },
    description: { type: String }
  }, { timestamps: true, id: false });

  const WastageSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    inventoryItemId: { type: String, required: true },
    inventoryItemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    date: { type: String, required: true },
    reason: { type: String },
    amount: { type: Number, required: true, default: 0 }
  }, { timestamps: true, id: false });

  const RecipeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    dishName: { type: String, required: true },
    dishId: { type: String },
    category: { type: String },
    appliance: { 
      type: String, 
      enum: ['Sandwich Maker', 'Air Fryer', 'Induction', 'Microwave', 'Mixer', 'Assembly'],
      default: 'Assembly' 
    },
    yieldPortions: { type: Number, default: 1 },
    ingredients: [{
      inventoryItemId: { type: String, required: true },
      inventoryItemName: { type: String, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, default: 'units' }
    }],
    notes: { type: String },
    isActive: { type: Boolean, default: true }
  }, { timestamps: true, id: false });

  const InventoryDeductionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    date: { type: String, required: true },
    orderId: { type: String },
    billId: { type: String },
    dishName: { type: String, required: true },
    inventoryItemId: { type: String, required: true },
    inventoryItemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'units' },
    source: { type: String, default: 'order' }
  }, { timestamps: true, id: false });

  Restaurant = mongoose.model('Restaurant', RestaurantSchema);
  FoodItem = mongoose.model('FoodItem', FoodItemSchema);
  const BankTransactionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    type: { type: String, required: true, enum: ['opening_balance', 'deposit', 'deduction'] },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    source: { type: String, default: 'Other' },
    description: { type: String, default: '' },
    referenceNumber: { type: String, default: null }
  }, { timestamps: true, id: false });

  Expense = mongoose.model('Expense', ExpenseSchema);
  Billing = mongoose.model('Billing', BillingSchema);
  User = mongoose.model('User', UserSchema);
  Inventory = mongoose.model('Inventory', InventorySchema);
  Order = mongoose.model('Order', OrderSchema);
  Customer = mongoose.model('Customer', CustomerSchema);
  Role = mongoose.model('Role', RoleSchema);
  PurchaseBill = mongoose.model('PurchaseBill', PurchaseBillSchema);
  Payout = mongoose.model('Payout', PayoutSchema);
  Wastage = mongoose.model('Wastage', WastageSchema);
  Recipe = mongoose.model('Recipe', RecipeSchema);
  InventoryDeduction = mongoose.model('InventoryDeduction', InventoryDeductionSchema);
  BankTransaction = mongoose.model('BankTransaction', BankTransactionSchema);
}

const store = {
  bankTransactions: [],
  restaurants: [
    {
      id: 'default-restaurant-id',
      name: 'Engineering Tadka Main Outlet',
      address: '123 Tech Park, Silicon Valley'
    }
  ],
  rooms: [],
  bookings: [],
  expenses: [],
  users: [
    {
      id: 'default-admin-id',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: crypto.createHash('sha256').update('admin123').digest('hex'),
      dob: '1990-01-01',
      age: 36,
      role: 'Admin'
    },
    {
      id: 'sagar-super-admin-id',
      firstName: 'Sagar',
      lastName: 'Manchadi',
      email: 'sagarmanchadi324@gmail.com',
      password: crypto.createHash('sha256').update('sagar@2410').digest('hex'),
      dob: '1995-01-01',
      age: 31,
      role: 'Super Admin'
    }
  ],
  roles: [
    {
      id: 'super-admin-role-id',
      name: 'Super Admin',
      sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'expenses', 'inventory', 'billing', 'users', 'system-status', 'payouts', 'wastage'],
      deleteAccess: true
    },
    {
      id: 'admin-role-id',
      name: 'Admin',
      sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'expenses', 'inventory', 'billing', 'payouts', 'wastage'],
      deleteAccess: false
    }
  ],
  inventory: [],
  orders: [],
  customers: [],
  payouts: [],
  wastages: []
};

function determineVeg(item) {
  if (item && item.isVeg !== undefined && item.isVeg !== null) return Boolean(item.isVeg);
  if (item && item.foodType !== undefined && item.foodType !== null) return item.foodType === 'veg';
  const name = (item?.name || '').toLowerCase();
  if (name.includes('chicken') || name.includes('egg') || name.includes('fish') || name.includes('mutton') || name.includes('meat') || name.includes('prawn') || name.includes('drumstick') || name.includes('shev puri') || name.includes('sev puri')) {
    return false;
  }
  return true;
}

async function listFoodItems(restaurantId) {
  if (useDb) {
    const query = restaurantId ? { restaurantId } : {};
    const items = await FoodItem.find(query);
    return items.map(r => {
      const isVeg = determineVeg(r);
      return {
        id: r.id,
        restaurantId: r.restaurantId,
        name: r.name,
        price: r.price,
        description: r.description,
        category: r.category,
        active: r.active !== false,
        isVeg,
        foodType: isVeg ? 'veg' : 'non-veg'
      };
    });
  }
  return (store.foodItems || []).filter(f => !restaurantId || f.restaurantId === restaurantId).map(f => {
    const isVeg = determineVeg(f);
    return {
      ...f,
      active: f.active !== false,
      isVeg,
      foodType: isVeg ? 'veg' : 'non-veg'
    };
  });
}

async function createFoodItem(data) {
  const id = uuidv4();
  const isVeg = data.isVeg !== undefined ? Boolean(data.isVeg) : (data.foodType ? data.foodType === 'veg' : determineVeg(data));
  const foodType = isVeg ? 'veg' : 'non-veg';
  if (useDb) {
    const item = new FoodItem({
      id,
      restaurantId: data.restaurantId,
      name: data.name,
      price: data.price,
      description: data.description || null,
      category: data.category || null,
      active: data.active !== undefined ? data.active : true,
      isVeg,
      foodType
    });
    await item.save();
    return {
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category,
      active: item.active,
      isVeg,
      foodType
    };
  }
  if (!store.foodItems) store.foodItems = [];
  const item = {
    id,
    restaurantId: data.restaurantId,
    name: data.name,
    price: data.price,
    description: data.description || null,
    category: data.category || null,
    active: data.active !== undefined ? data.active : true,
    isVeg,
    foodType
  };
  store.foodItems.push(item);
  return item;
}

async function getFoodItem(id) {
  if (useDb) {
    const item = await FoodItem.findOne({ id });
    if (!item) return null;
    const isVeg = determineVeg(item);
    return {
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category,
      active: item.active !== false,
      isVeg,
      foodType: isVeg ? 'veg' : 'non-veg'
    };
  }
  if (!store.foodItems) store.foodItems = [];
  const found = store.foodItems.find(f => f.id === id);
  if (!found) return null;
  const isVeg = determineVeg(found);
  return {
    ...found,
    active: found.active !== false,
    isVeg,
    foodType: isVeg ? 'veg' : 'non-veg'
  };
}

async function updateFoodItem(id, data) {
  if (useDb) {
    const item = await FoodItem.findOne({ id });
    if (!item) return null;
    if (data.name !== undefined) item.name = data.name;
    if (data.price !== undefined) item.price = data.price;
    if (data.description !== undefined) item.description = data.description;
    if (data.category !== undefined) item.category = data.category;
    if (data.restaurantId !== undefined) item.restaurantId = data.restaurantId;
    if (data.active !== undefined) item.active = data.active;
    if (data.isVeg !== undefined) {
      item.isVeg = Boolean(data.isVeg);
      item.foodType = item.isVeg ? 'veg' : 'non-veg';
    } else if (data.foodType !== undefined) {
      item.foodType = data.foodType;
      item.isVeg = data.foodType === 'veg';
    }
    await item.save();
    const isVeg = determineVeg(item);
    return {
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category,
      active: item.active,
      isVeg,
      foodType: isVeg ? 'veg' : 'non-veg'
    };
  }
  if (!store.foodItems) store.foodItems = [];
  const idx = store.foodItems.findIndex(f => f.id === id);
  if (idx === -1) return null;
  const isVeg = data.isVeg !== undefined ? Boolean(data.isVeg) : (data.foodType ? data.foodType === 'veg' : store.foodItems[idx].isVeg);
  store.foodItems[idx] = {
    ...store.foodItems[idx],
    ...data,
    isVeg: isVeg !== undefined ? isVeg : determineVeg(store.foodItems[idx]),
    foodType: (isVeg !== undefined ? isVeg : determineVeg(store.foodItems[idx])) ? 'veg' : 'non-veg'
  };
  return { ...store.foodItems[idx], active: store.foodItems[idx].active !== false };
}

async function deleteFoodItem(id) {
  if (useDb) {
    const res = await FoodItem.deleteOne({ id });
    return res.deletedCount > 0;
  }
  if (!store.foodItems) store.foodItems = [];
  const idx = store.foodItems.findIndex(f => f.id === id);
  if (idx === -1) return false;
  store.foodItems.splice(idx, 1);
  return true;
}

const mapBilling = r => {
  const cgst = r.cgst || 0;
  const sgst = r.sgst || 0;
  const amount = r.amount || 0;
  const total = amount + cgst + sgst;
  const mode = (r.paymentMode || 'Cash').toLowerCase();
  
  let cashAmount = r.cashAmount || 0;
  let upiAmount = r.upiAmount || 0;
  if (!r.cashAmount && !r.upiAmount) {
    if (mode === 'cash') {
      cashAmount = total;
    } else if (mode === 'upi') {
      upiAmount = total;
    }
  }
  
  return {
    id: r.id,
    amount,
    restaurantId: r.restaurantId,
    date: r.date,
    description: r.description,
    status: r.status,
    mobile: r.mobile,
    emailId: r.emailId,
    cgst,
    sgst,
    foodItems: r.foodItems || [],
    orderNumber: r.orderNumber,
    discount: r.discount || 0,
    paymentMode: r.paymentMode || 'Cash',
    orderType: r.orderType || 'dinein',
    cashAmount,
    upiAmount
  };
};

async function listBillings(restaurantId) {
  if (useDb) {
    const query = restaurantId ? { restaurantId } : {};
    const rows = await Billing.find(query);
    return rows.map(mapBilling);
  }
  return (store.billings || []).filter(b => !restaurantId || b.restaurantId === restaurantId).map(mapBilling);
}

async function checkLoyaltyExpiry(customer) {
  if (!customer || !customer.loyaltyPoints) return customer;
  const expiryDays = 30;
  const now = new Date();
  const lastActivity = customer.lastLoyaltyActivity ? new Date(customer.lastLoyaltyActivity) : new Date();
  const diffTime = now - lastActivity;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays > expiryDays && customer.loyaltyPoints > 0) {
    customer.loyaltyPoints = 0;
    if (useDb && customer.save) {
      await customer.save();
    }
  }
  return customer;
}

function checkLoyaltyExpiryInMem(c) {
  if (!c || !c.loyaltyPoints) return c;
  const expiryDays = 30;
  const now = new Date();
  const lastActivity = c.lastLoyaltyActivity ? new Date(c.lastLoyaltyActivity) : new Date();
  const diffTime = now - lastActivity;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays > expiryDays && c.loyaltyPoints > 0) {
    c.loyaltyPoints = 0;
  }
  return c;
}

async function createBilling(data) {
  const id = uuidv4();
  const totalAmount = (data.amount || 0) + (data.cgst || 0) + (data.sgst || 0);
  const points = Math.round(totalAmount);

  if (useDb) {
    const billing = new Billing({
      id,
      amount: data.amount,
      restaurantId: data.restaurantId || null,
      date: data.date || null,
      description: data.description || null,
      status: data.status || 'pending',
      mobile: data.mobile || null,
      emailId: data.emailId || null,
      cgst: data.cgst || 0,
      sgst: data.sgst || 0,
      foodItems: data.foodItems || [],
      orderNumber: data.orderNumber || null,
      discount: data.discount || 0,
      paymentMode: data.paymentMode || 'Cash',
      orderType: data.orderType || 'dinein',
      cashAmount: data.cashAmount || 0,
      upiAmount: data.upiAmount || 0
    });
    await billing.save();

    // Create or update Customer if mobile or email is present
    if (data.mobile || data.emailId) {
      try {
        let customer = null;
        if (data.mobile) {
          customer = await Customer.findOne({ mobile: data.mobile });
        }
        if (!customer && data.emailId) {
          customer = await Customer.findOne({ emailId: data.emailId });
        }

        if (customer) {
          await checkLoyaltyExpiry(customer);
          customer.loyaltyPoints = (customer.loyaltyPoints || 0) + points;
          customer.lastLoyaltyActivity = new Date();
          if (data.emailId && !customer.emailId) {
            customer.emailId = data.emailId;
          }
          if (data.mobile && !customer.mobile) {
            customer.mobile = data.mobile;
          }
          await customer.save();
        } else {
          customer = new Customer({
            id: uuidv4(),
            mobile: data.mobile || undefined,
            emailId: data.emailId || undefined,
            loyaltyPoints: points,
            lastLoyaltyActivity: new Date()
          });
          await customer.save();
        }
      } catch (err) {
        console.error('Error updating customer loyalty:', err);
      }
    }

    // Auto-deduct inventory based on recipes (TEMPORARILY DISABLED: comment out until accurate inventory data is populated)
    /*
    if (data.foodItems && Array.isArray(data.foodItems) && data.foodItems.length > 0) {
      try {
        await deductInventoryForItems(data.restaurantId, data.foodItems, id, 'billing', data.date);
      } catch (deductErr) {
        console.error('Error auto-deducting inventory for billing:', deductErr);
      }
    }
    */

    return mapBilling(billing);
  }
  if (!store.billings) store.billings = [];
  const billing = { id, amount: data.amount, restaurantId: data.restaurantId || null, date: data.date || null, description: data.description || null, status: data.status || 'pending', mobile: data.mobile || null, emailId: data.emailId || null, cgst: data.cgst || 0, sgst: data.sgst || 0, foodItems: data.foodItems || [], orderNumber: data.orderNumber || null, discount: data.discount || 0, paymentMode: data.paymentMode || 'Cash', orderType: data.orderType || 'dinein', cashAmount: data.cashAmount || 0, upiAmount: data.upiAmount || 0 };
  store.billings.push(billing);

  // In-memory Customer creation/update
  if (data.mobile || data.emailId) {
    if (!store.customers) store.customers = [];
    let customer = null;
    if (data.mobile) {
      customer = store.customers.find(c => c.mobile === data.mobile);
    }
    if (!customer && data.emailId) {
      customer = store.customers.find(c => c.emailId === data.emailId);
    }

    if (customer) {
      checkLoyaltyExpiryInMem(customer);
      customer.loyaltyPoints = (customer.loyaltyPoints || 0) + points;
      customer.lastLoyaltyActivity = new Date();
      if (data.emailId && !customer.emailId) customer.emailId = data.emailId;
      if (data.mobile && !customer.mobile) customer.mobile = data.mobile;
    } else {
      store.customers.push({
        id: uuidv4(),
        mobile: data.mobile || null,
        emailId: data.emailId || null,
        loyaltyPoints: points,
        lastLoyaltyActivity: new Date()
      });
    }
  }

  return billing;
}

async function getBilling(id) {
  if (useDb) {
    const row = await Billing.findOne({ id });
    if (!row) return null;
    return mapBilling(row);
  }
  if (!store.billings) store.billings = [];
  const found = store.billings.find(b => b.id === id);
  return found ? mapBilling(found) : null;
}

async function updateBilling(id, data) {
  if (useDb) {
    const row = await Billing.findOne({ id });
    if (!row) return null;
    if (data.amount !== undefined) row.amount = data.amount;
    if (data.restaurantId !== undefined) row.restaurantId = data.restaurantId;
    if (data.date !== undefined) row.date = data.date;
    if (data.description !== undefined) row.description = data.description;
    if (data.status !== undefined) row.status = data.status;
    if (data.mobile !== undefined) row.mobile = data.mobile;
    if (data.emailId !== undefined) row.emailId = data.emailId;
    if (data.cgst !== undefined) row.cgst = data.cgst;
    if (data.sgst !== undefined) row.sgst = data.sgst;
    if (data.foodItems !== undefined) row.foodItems = data.foodItems;
    if (data.orderNumber !== undefined) row.orderNumber = data.orderNumber;
    if (data.discount !== undefined) row.discount = data.discount;
    if (data.paymentMode !== undefined) row.paymentMode = data.paymentMode;
    if (data.cashAmount !== undefined) row.cashAmount = data.cashAmount;
    if (data.upiAmount !== undefined) row.upiAmount = data.upiAmount;
    await row.save();
    return mapBilling(row);
  }
  if (!store.billings) store.billings = [];
  const idx = store.billings.findIndex(b => b.id === id);
  if (idx === -1) return null;
  store.billings[idx] = { ...store.billings[idx], ...data };
  return mapBilling(store.billings[idx]);
}

async function deleteBilling(id) {
  if (useDb) {
    const res = await Billing.deleteOne({ id });
    return res.deletedCount > 0;
  }
  if (!store.billings) store.billings = [];
  const idx = store.billings.findIndex(b => b.id === id);
  if (idx === -1) return false;
  store.billings.splice(idx, 1);
  return true;
}

async function listExpenses(restaurantId) {
  if (useDb) {
    const query = restaurantId ? { restaurantId } : {};
    const rows = await Expense.find(query);
    return rows.map(r => ({ 
      id: r.id, 
      restaurantId: r.restaurantId, 
      amount: r.amount, 
      description: r.description, 
      date: r.date, 
      category: r.category, 
      imageUrl: r.imageUrl,
      createdBy: r.createdBy,
      updatedBy: r.updatedBy,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
  }
  return (store.expenses || []).filter(e => !restaurantId || e.restaurantId === restaurantId);
}

async function createExpense(data) {
  const id = uuidv4();
  if (useDb) {
    const expense = new Expense({
      id,
      restaurantId: data.restaurantId,
      amount: data.amount,
      description: data.description || null,
      date: data.date || null,
      category: data.category || null,
      imageUrl: data.imageUrl || null,
      createdBy: data.createdBy || null,
      updatedBy: data.updatedBy || null
    });
    await expense.save();
    return { 
      id: expense.id, 
      restaurantId: expense.restaurantId, 
      amount: expense.amount, 
      description: expense.description, 
      date: expense.date, 
      category: expense.category, 
      imageUrl: expense.imageUrl,
      createdBy: expense.createdBy,
      updatedBy: expense.updatedBy,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt
    };
  }
  if (!store.expenses) store.expenses = [];
  const now = new Date().toISOString();
  const expense = {
    id,
    restaurantId: data.restaurantId,
    amount: data.amount,
    description: data.description || null,
    date: data.date || null,
    category: data.category || null,
    imageUrl: data.imageUrl || null,
    createdBy: data.createdBy || 'System',
    updatedBy: data.updatedBy || null,
    createdAt: now,
    updatedAt: now
  };
  store.expenses.push(expense);
  return expense;
}

async function getExpense(id) {
  if (useDb) {
    const row = await Expense.findOne({ id });
    if (!row) return null;
    return { 
      id: row.id, 
      restaurantId: row.restaurantId, 
      amount: row.amount, 
      description: row.description, 
      date: row.date, 
      category: row.category, 
      imageUrl: row.imageUrl,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
  if (!store.expenses) store.expenses = [];
  return store.expenses.find(e => e.id === id) || null;
}

async function updateExpense(id, data) {
  if (useDb) {
    const row = await Expense.findOne({ id });
    if (!row) return null;
    if (data.amount !== undefined) row.amount = data.amount;
    if (data.description !== undefined) row.description = data.description;
    if (data.date !== undefined) row.date = data.date;
    if (data.category !== undefined) row.category = data.category;
    if (data.restaurantId !== undefined) row.restaurantId = data.restaurantId;
    if (data.imageUrl !== undefined) row.imageUrl = data.imageUrl;
    if (data.updatedBy !== undefined) row.updatedBy = data.updatedBy;
    await row.save();
    return { 
      id: row.id, 
      restaurantId: row.restaurantId, 
      amount: row.amount, 
      description: row.description, 
      date: row.date, 
      category: row.category, 
      imageUrl: row.imageUrl,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
  if (!store.expenses) store.expenses = [];
  const idx = store.expenses.findIndex(e => e.id === id);
  if (idx === -1) return null;
  store.expenses[idx] = { 
    ...store.expenses[idx], 
    ...data,
    updatedAt: new Date().toISOString()
  };
  return store.expenses[idx];
}

async function deleteExpense(id) {
  if (useDb) {
    const res = await Expense.deleteOne({ id });
    return res.deletedCount > 0;
  }
  if (!store.expenses) store.expenses = [];
  const idx = store.expenses.findIndex(e => e.id === id);
  if (idx === -1) return false;
  store.expenses.splice(idx, 1);
  return true;
}

async function listRestaurants() {
  if (useDb) {
    const rows = await Restaurant.find({});
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      address: r.address,
      gstin: r.gstin || '',
      legalName: r.legalName || '',
      tradeName: r.tradeName || '',
      state: r.state || '',
      stateCode: r.stateCode || '',
      filingFrequency: r.filingFrequency || 'monthly',
      defaultGstScheme: r.defaultGstScheme || 'restaurant_5_no_itc'
    }));
  }
  return (store.restaurants || []).map(r => ({
    id: r.id,
    name: r.name,
    address: r.address,
    gstin: r.gstin || '',
    legalName: r.legalName || '',
    tradeName: r.tradeName || '',
    state: r.state || '',
    stateCode: r.stateCode || '',
    filingFrequency: r.filingFrequency || 'monthly',
    defaultGstScheme: r.defaultGstScheme || 'restaurant_5_no_itc'
  }));
}

async function createRestaurant(data) {
  const id = uuidv4();
  if (useDb) {
    const restaurant = new Restaurant({
      id,
      name: data.name,
      address: data.address || null,
      gstin: data.gstin || '',
      legalName: data.legalName || '',
      tradeName: data.tradeName || '',
      state: data.state || '',
      stateCode: data.stateCode || '',
      filingFrequency: data.filingFrequency || 'monthly',
      defaultGstScheme: data.defaultGstScheme || 'restaurant_5_no_itc'
    });
    await restaurant.save();
    return {
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      gstin: restaurant.gstin,
      legalName: restaurant.legalName,
      tradeName: restaurant.tradeName,
      state: restaurant.state,
      stateCode: restaurant.stateCode,
      filingFrequency: restaurant.filingFrequency,
      defaultGstScheme: restaurant.defaultGstScheme
    };
  }
  if (!store.restaurants) store.restaurants = [];
  const restaurant = {
    id,
    name: data.name,
    address: data.address || null,
    gstin: data.gstin || '',
    legalName: data.legalName || '',
    tradeName: data.tradeName || '',
    state: data.state || '',
    stateCode: data.stateCode || '',
    filingFrequency: data.filingFrequency || 'monthly',
    defaultGstScheme: data.defaultGstScheme || 'restaurant_5_no_itc'
  };
  store.restaurants.push(restaurant);
  return restaurant;
}

async function getRestaurant(id) {
  if (useDb) {
    const row = await Restaurant.findOne({ id });
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      gstin: row.gstin || '',
      legalName: row.legalName || '',
      tradeName: row.tradeName || '',
      state: row.state || '',
      stateCode: row.stateCode || '',
      filingFrequency: row.filingFrequency || 'monthly',
      defaultGstScheme: row.defaultGstScheme || 'restaurant_5_no_itc'
    };
  }
  if (!store.restaurants) store.restaurants = [];
  const r = store.restaurants.find(h => h.id === id);
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    address: r.address,
    gstin: r.gstin || '',
    legalName: r.legalName || '',
    tradeName: r.tradeName || '',
    state: r.state || '',
    stateCode: r.stateCode || '',
    filingFrequency: r.filingFrequency || 'monthly',
    defaultGstScheme: r.defaultGstScheme || 'restaurant_5_no_itc'
  };
}

async function updateRestaurant(id, data) {
  if (useDb) {
    const row = await Restaurant.findOne({ id });
    if (!row) return null;
    if (data.name !== undefined) row.name = data.name;
    if (data.address !== undefined) row.address = data.address;
    if (data.gstin !== undefined) row.gstin = data.gstin;
    if (data.legalName !== undefined) row.legalName = data.legalName;
    if (data.tradeName !== undefined) row.tradeName = data.tradeName;
    if (data.state !== undefined) row.state = data.state;
    if (data.stateCode !== undefined) row.stateCode = data.stateCode;
    if (data.filingFrequency !== undefined) row.filingFrequency = data.filingFrequency;
    if (data.defaultGstScheme !== undefined) row.defaultGstScheme = data.defaultGstScheme;
    await row.save();
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      gstin: row.gstin || '',
      legalName: row.legalName || '',
      tradeName: row.tradeName || '',
      state: row.state || '',
      stateCode: row.stateCode || '',
      filingFrequency: row.filingFrequency || 'monthly',
      defaultGstScheme: row.defaultGstScheme || 'restaurant_5_no_itc'
    };
  }
  if (!store.restaurants) store.restaurants = [];
  const idx = store.restaurants.findIndex(h => h.id === id);
  if (idx === -1) return null;
  store.restaurants[idx] = { ...store.restaurants[idx], ...data };
  return store.restaurants[idx];
}

async function deleteRestaurant(id) {
  if (useDb) {
    const res = await Restaurant.deleteOne({ id });
    return res.deletedCount > 0;
  }
  if (!store.restaurants) store.restaurants = [];
  const idx = store.restaurants.findIndex(h => h.id === id);
  if (idx === -1) return false;
  store.restaurants.splice(idx, 1);
  return true;
}

async function listRoles() {
  if (useDb) {
    const rows = await Role.find({});
    return rows.map(r => ({ id: r.id, name: r.name, sidebarAccess: r.sidebarAccess || [], deleteAccess: !!r.deleteAccess }));
  }
  return store.roles || [];
}

async function createRole(data) {
  const id = uuidv4();
  if (useDb) {
    const role = new Role({
      id,
      name: data.name,
      sidebarAccess: data.sidebarAccess || [],
      deleteAccess: !!data.deleteAccess
    });
    await role.save();
    return { id: role.id, name: role.name, sidebarAccess: role.sidebarAccess, deleteAccess: role.deleteAccess };
  }
  if (!store.roles) store.roles = [];
  const role = { id, name: data.name, sidebarAccess: data.sidebarAccess || [], deleteAccess: !!data.deleteAccess };
  store.roles.push(role);
  return role;
}

async function getRole(id) {
  if (useDb) {
    const row = await Role.findOne({ id });
    if (!row) return null;
    return { id: row.id, name: row.name, sidebarAccess: row.sidebarAccess || [], deleteAccess: !!row.deleteAccess };
  }
  if (!store.roles) store.roles = [];
  return store.roles.find(r => r.id === id) || null;
}

async function getRoleByName(name) {
  if (useDb) {
    const row = await Role.findOne({ name });
    if (!row) return null;
    return { id: row.id, name: row.name, sidebarAccess: row.sidebarAccess || [], deleteAccess: !!row.deleteAccess };
  }
  if (!store.roles) store.roles = [];
  return store.roles.find(r => r.name === name) || null;
}

async function updateRole(id, data) {
  if (useDb) {
    const row = await Role.findOne({ id });
    if (!row) return null;
    if (data.name !== undefined) row.name = data.name;
    if (data.sidebarAccess !== undefined) row.sidebarAccess = data.sidebarAccess;
    if (data.deleteAccess !== undefined) row.deleteAccess = !!data.deleteAccess;
    await row.save();
    return { id: row.id, name: row.name, sidebarAccess: row.sidebarAccess, deleteAccess: row.deleteAccess };
  }
  if (!store.roles) store.roles = [];
  const idx = store.roles.findIndex(r => r.id === id);
  if (idx === -1) return null;
  store.roles[idx] = { ...store.roles[idx], ...data };
  return store.roles[idx];
}

async function deleteRole(id) {
  if (useDb) {
    const res = await Role.deleteOne({ id });
    return res.deletedCount > 0;
  }
  if (!store.roles) store.roles = [];
  const idx = store.roles.findIndex(r => r.id === id);
  if (idx === -1) return false;
  store.roles.splice(idx, 1);
  return true;
}

async function listUsers() {
  if (useDb) {
    const rows = await User.find({});
    return rows.map(r => ({ id: r.id, firstName: r.firstName, lastName: r.lastName, email: r.email, password: r.password, dob: r.dob, age: r.age, role: r.role || 'Admin' }));
  }
  return store.users || [];
}

async function createUser(data) {
  const id = uuidv4();
  if (useDb) {
    const user = new User({
      id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      dob: data.dob,
      age: data.age,
      role: data.role || 'Admin'
    });
    await user.save();
    return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, dob: user.dob, age: user.age, role: user.role };
  }
  if (!store.users) store.users = [];
  const user = { id, firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password, dob: data.dob, age: data.age, role: data.role || 'Admin' };
  store.users.push(user);
  return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, dob: user.dob, age: user.age, role: user.role };
}

async function getUser(id) {
  if (useDb) {
    const row = await User.findOne({ id });
    if (!row) return null;
    return { id: row.id, firstName: row.firstName, lastName: row.lastName, email: row.email, password: row.password, dob: row.dob, age: row.age, role: row.role || 'Admin' };
  }
  if (!store.users) store.users = [];
  return store.users.find(u => u.id === id) || null;
}

async function getUserByEmail(email) {
  if (useDb) {
    const row = await User.findOne({ email });
    if (!row) return null;
    return { id: row.id, firstName: row.firstName, lastName: row.lastName, email: row.email, password: row.password, dob: row.dob, age: row.age, role: row.role || 'Admin' };
  }
  if (!store.users) store.users = [];
  return store.users.find(u => u.email === email) || null;
}

async function updateUser(id, data) {
  if (useDb) {
    const row = await User.findOne({ id });
    if (!row) return null;
    if (data.firstName !== undefined) row.firstName = data.firstName;
    if (data.lastName !== undefined) row.lastName = data.lastName;
    if (data.email !== undefined) row.email = data.email;
    if (data.password !== undefined) row.password = data.password;
    if (data.dob !== undefined) row.dob = data.dob;
    if (data.age !== undefined) row.age = data.age;
    if (data.role !== undefined) row.role = data.role;
    await row.save();
    return { id: row.id, firstName: row.firstName, lastName: row.lastName, email: row.email, dob: row.dob, age: row.age, role: row.role };
  }
  if (!store.users) store.users = [];
  const idx = store.users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  store.users[idx] = { ...store.users[idx], ...data };
  return { id: store.users[idx].id, firstName: store.users[idx].firstName, lastName: store.users[idx].lastName, email: store.users[idx].email, dob: store.users[idx].dob, age: store.users[idx].age, role: store.users[idx].role };
}

async function deleteUser(id) {
  if (useDb) {
    const res = await User.deleteOne({ id });
    return res.deletedCount > 0;
  }
  if (!store.users) store.users = [];
  const idx = store.users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  store.users.splice(idx, 1);
  return true;
}

async function listInventory(restaurantId) {
  if (useDb) {
    const query = restaurantId ? { restaurantId } : {};
    const rows = await Inventory.find(query);
    return rows.map(r => {
      const quantity = r.quantity !== undefined ? r.quantity : 0;
      const threshold = r.threshold !== undefined ? r.threshold : 10;
      const status = quantity <= 0 ? 'out' : (quantity <= threshold ? 'low' : 'healthy');
      return {
        id: r.id,
        restaurantId: r.restaurantId,
        name: r.name,
        quantity,
        unit: r.unit || 'units',
        threshold,
        status
      };
    });
  }
  return (store.inventory || []).filter(i => !restaurantId || i.restaurantId === restaurantId).map(i => {
    const quantity = i.quantity !== undefined ? i.quantity : 0;
    const threshold = i.threshold !== undefined ? i.threshold : 10;
    const status = quantity <= 0 ? 'out' : (quantity <= threshold ? 'low' : 'healthy');
    return {
      quantity,
      unit: 'units',
      threshold,
      status,
      ...i
    };
  });
}

async function createInventory(data) {
  const id = uuidv4();
  if (useDb) {
    const item = new Inventory({
      id,
      restaurantId: data.restaurantId,
      name: data.name,
      quantity: data.quantity !== undefined ? data.quantity : 0,
      unit: data.unit || 'units',
      threshold: data.threshold !== undefined ? data.threshold : 10
    });
    await item.save();
    return {
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      threshold: item.threshold
    };
  }
  if (!store.inventory) store.inventory = [];
  const item = {
    id,
    restaurantId: data.restaurantId,
    name: data.name,
    quantity: data.quantity !== undefined ? data.quantity : 0,
    unit: data.unit || 'units',
    threshold: data.threshold !== undefined ? data.threshold : 10
  };
  store.inventory.push(item);
  return item;
}

async function getInventory(id) {
  if (useDb) {
    const row = await Inventory.findOne({ id });
    if (!row) return null;
    return {
      id: row.id,
      restaurantId: row.restaurantId,
      name: row.name,
      quantity: row.quantity !== undefined ? row.quantity : 0,
      unit: row.unit || 'units',
      threshold: row.threshold !== undefined ? row.threshold : 10
    };
  }
  if (!store.inventory) store.inventory = [];
  const found = store.inventory.find(i => i.id === id);
  if (!found) return null;
  return {
    quantity: 0,
    unit: 'units',
    threshold: 10,
    ...found
  };
}

async function updateInventory(id, data) {
  if (useDb) {
    const row = await Inventory.findOne({ id });
    if (!row) return null;
    if (data.name !== undefined) row.name = data.name;
    if (data.restaurantId !== undefined) row.restaurantId = data.restaurantId;
    if (data.quantity !== undefined) row.quantity = data.quantity;
    if (data.unit !== undefined) row.unit = data.unit;
    if (data.threshold !== undefined) row.threshold = data.threshold;
    await row.save();
    return {
      id: row.id,
      restaurantId: row.restaurantId,
      name: row.name,
      quantity: row.quantity,
      unit: row.unit,
      threshold: row.threshold
    };
  }
  if (!store.inventory) store.inventory = [];
  const idx = store.inventory.findIndex(i => i.id === id);
  if (idx === -1) return null;
  store.inventory[idx] = { ...store.inventory[idx], ...data };
  return store.inventory[idx];
}

async function deleteInventory(id) {
  if (useDb) {
    const res = await Inventory.deleteOne({ id });
    return res.deletedCount > 0;
  }
  if (!store.inventory) store.inventory = [];
  const idx = store.inventory.findIndex(i => i.id === id);
  if (idx === -1) return false;
  store.inventory.splice(idx, 1);
  return true;
}
const mapOrder = r => {
  const total = r.totalAmount || 0;
  const mode = (r.paymentMode || 'Cash').toLowerCase();
  
  let cashAmount = r.cashAmount || 0;
  let upiAmount = r.upiAmount || 0;
  if (!r.cashAmount && !r.upiAmount) {
    if (mode === 'cash') {
      cashAmount = total;
    } else if (mode === 'upi') {
      upiAmount = total;
    }
  }

  return {
    id: r.id,
    restaurantId: r.restaurantId,
    tableNo: r.tableNo,
    mobile: r.mobile,
    emailId: r.emailId,
    items: r.items,
    status: r.status,
    totalAmount: r.totalAmount,
    date: r.date,
    orderNumber: r.orderNumber,
    discount: r.discount || 0,
    orderType: r.orderType || 'dinein',
    paymentMode: r.paymentMode || 'Cash',
    paymentStatus: r.paymentStatus || 'pending',
    razorpayOrderId: r.razorpayOrderId,
    razorpayPaymentId: r.razorpayPaymentId,
    razorpaySignature: r.razorpaySignature,
    cashAmount,
    upiAmount
  };
};

async function listOrders(restaurantId, includePending = false) {
  if (useDb) {
    const query = restaurantId ? { restaurantId } : {};
    if (!includePending) {
      query.status = { $ne: 'pending_payment' };
    }
    const rows = await Order.find(query);
    return rows.map(mapOrder);
  }
  if (!store.orders) store.orders = [];
  return store.orders.filter(o =>
    (!restaurantId || o.restaurantId === restaurantId) &&
    (includePending || o.status !== 'pending_payment')
  ).map(mapOrder);
}

async function createOrder(data) {
  const id = uuidv4();
  const dateStr = data.date || new Date().toLocaleDateString('sv');

  // Calculate next orderNumber
  let orderNumber = 1;
  if (useDb) {
    const lastOrderWithNum = await Order.findOne({ restaurantId: data.restaurantId, orderNumber: { $exists: true } }).sort({ orderNumber: -1 });
    if (lastOrderWithNum && lastOrderWithNum.orderNumber) {
      orderNumber = lastOrderWithNum.orderNumber + 1;
    } else {
      const count = await Order.countDocuments({ restaurantId: data.restaurantId });
      orderNumber = count + 1;
    }
  } else {
    if (!store.orders) store.orders = [];
    const restaurantOrders = store.orders.filter(o => o.restaurantId === data.restaurantId);
    if (restaurantOrders.length > 0) {
      const maxNum = Math.max(...restaurantOrders.map(o => o.orderNumber || 0));
      orderNumber = maxNum > 0 ? maxNum + 1 : restaurantOrders.length + 1;
    }
  }

  const orderData = {
    id,
    restaurantId: data.restaurantId,
    tableNo: data.tableNo,
    mobile: data.mobile || null,
    emailId: data.emailId || null,
    items: data.items || [],
    status: data.status || 'received',
    totalAmount: data.totalAmount || 0,
    date: dateStr,
    orderNumber,
    discount: data.discount || 0,
    orderType: data.orderType || 'dinein',
    paymentMode: data.paymentMode || 'Cash',
    paymentStatus: data.paymentStatus || 'pending',
    razorpayOrderId: data.razorpayOrderId || null,
    razorpayPaymentId: data.razorpayPaymentId || null,
    razorpaySignature: data.razorpaySignature || null,
    cashAmount: data.cashAmount || 0,
    upiAmount: data.upiAmount || 0
  };
  if (useDb) {
    const item = new Order(orderData);
    await item.save();

    // Auto-deduct inventory based on recipes (TEMPORARILY DISABLED: comment out until accurate inventory data is populated)
    /*
    if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0 && orderData.status !== 'pending_payment') {
      try {
        await deductInventoryForItems(orderData.restaurantId, orderData.items, id, 'order', dateStr);
      } catch (deductErr) {
        console.error('Error auto-deducting inventory for order:', deductErr);
      }
    }
    */

    return mapOrder(item);
  }
  if (!store.orders) store.orders = [];
  store.orders.push(orderData);

  // Auto-deduct inventory based on recipes (TEMPORARILY DISABLED: comment out until accurate inventory data is populated)
  /*
  if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0 && orderData.status !== 'pending_payment') {
    try {
      await deductInventoryForItems(orderData.restaurantId, orderData.items, id, 'order', dateStr);
    } catch (deductErr) {
      console.error('Error auto-deducting inventory for order:', deductErr);
    }
  }
  */

  return mapOrder(orderData);
}

async function getOrder(id) {
  if (useDb) {
    const row = await Order.findOne({ id });
    if (!row) return null;
    return mapOrder(row);
  }
  if (!store.orders) store.orders = [];
  const found = store.orders.find(o => o.id === id);
  return found ? mapOrder(found) : null;
}

async function updateOrder(id, data) {
  if (useDb) {
    const row = await Order.findOne({ id });
    if (!row) return null;
    if (data.restaurantId !== undefined) row.restaurantId = data.restaurantId;
    if (data.tableNo !== undefined) row.tableNo = data.tableNo;
    if (data.mobile !== undefined) row.mobile = data.mobile;
    if (data.emailId !== undefined) row.emailId = data.emailId;
    if (data.items !== undefined) row.items = data.items;
    if (data.status !== undefined) row.status = data.status;
    if (data.totalAmount !== undefined) row.totalAmount = data.totalAmount;
    if (data.date !== undefined) row.date = data.date;
    if (data.orderNumber !== undefined) row.orderNumber = data.orderNumber;
    if (data.discount !== undefined) row.discount = data.discount;
    if (data.orderType !== undefined) row.orderType = data.orderType;
    if (data.paymentMode !== undefined) row.paymentMode = data.paymentMode;
    if (data.paymentStatus !== undefined) row.paymentStatus = data.paymentStatus;
    if (data.razorpayOrderId !== undefined) row.razorpayOrderId = data.razorpayOrderId;
    if (data.razorpayPaymentId !== undefined) row.razorpayPaymentId = data.razorpayPaymentId;
    if (data.razorpaySignature !== undefined) row.razorpaySignature = data.razorpaySignature;
    if (data.cashAmount !== undefined) row.cashAmount = data.cashAmount;
    if (data.upiAmount !== undefined) row.upiAmount = data.upiAmount;
    await row.save();
    return mapOrder(row);
  }
  if (!store.orders) store.orders = [];
  const idx = store.orders.findIndex(o => o.id === id);
  if (idx === -1) return null;
  store.orders[idx] = { ...store.orders[idx], ...data };
  return mapOrder(store.orders[idx]);
}

async function deleteOrder(id) {
  if (useDb) {
    const res = await Order.deleteOne({ id });
    return res.deletedCount > 0;
  }
  if (!store.orders) store.orders = [];
  const idx = store.orders.findIndex(o => o.id === id);
  if (idx === -1) return false;
  store.orders.splice(idx, 1);
  return true;
}
async function lookupCustomer(query) {
  if (useDb) {
    let row = null;
    if (query.mobile) {
      row = await Customer.findOne({ mobile: query.mobile });
    }
    if (!row && query.emailId) {
      row = await Customer.findOne({ emailId: query.emailId });
    }
    if (!row) return null;
    await checkLoyaltyExpiry(row);
    return { id: row.id, mobile: row.mobile, emailId: row.emailId, loyaltyPoints: row.loyaltyPoints, lastLoyaltyActivity: row.lastLoyaltyActivity };
  }

  if (!store.customers) store.customers = [];
  let row = null;
  if (query.mobile) {
    row = store.customers.find(c => c.mobile === query.mobile);
  }
  if (!row && query.emailId) {
    row = store.customers.find(c => c.emailId === query.emailId);
  }
  if (row) {
    checkLoyaltyExpiryInMem(row);
  }
  return row || null;
}

async function listCustomers() {
  if (useDb) {
    const rows = await Customer.find({});
    for (const r of rows) {
      await checkLoyaltyExpiry(r);
    }
    return rows.map(r => ({ id: r.id, mobile: r.mobile, emailId: r.emailId, loyaltyPoints: r.loyaltyPoints, lastLoyaltyActivity: r.lastLoyaltyActivity }));
  }
  if (!store.customers) store.customers = [];
  for (const c of store.customers) {
    checkLoyaltyExpiryInMem(c);
  }
  return store.customers;
}

async function createCustomer(data) {
  const id = uuidv4();
  const customerData = {
    id,
    mobile: data.mobile || null,
    emailId: data.emailId || null,
    loyaltyPoints: data.loyaltyPoints || 0,
    lastLoyaltyActivity: new Date()
  };
  if (useDb) {
    const cust = new Customer(customerData);
    await cust.save();
    return customerData;
  }
  if (!store.customers) store.customers = [];
  store.customers.push(customerData);
  return customerData;
}

async function getCustomer(id) {
  if (useDb) {
    const row = await Customer.findOne({ id });
    if (!row) return null;
    await checkLoyaltyExpiry(row);
    return { id: row.id, mobile: row.mobile, emailId: row.emailId, loyaltyPoints: row.loyaltyPoints, lastLoyaltyActivity: row.lastLoyaltyActivity };
  }
  if (!store.customers) store.customers = [];
  const c = store.customers.find(x => x.id === id);
  if (c) {
    checkLoyaltyExpiryInMem(c);
  }
  return c || null;
}

async function updateCustomer(id, data) {
  if (useDb) {
    const row = await Customer.findOne({ id });
    if (!row) return null;
    if (data.mobile !== undefined) row.mobile = data.mobile;
    if (data.emailId !== undefined) row.emailId = data.emailId;
    if (data.loyaltyPoints !== undefined) {
      row.loyaltyPoints = data.loyaltyPoints;
      row.lastLoyaltyActivity = new Date();
    }
    await row.save();
    return { id: row.id, mobile: row.mobile, emailId: row.emailId, loyaltyPoints: row.loyaltyPoints, lastLoyaltyActivity: row.lastLoyaltyActivity };
  }
  if (!store.customers) store.customers = [];
  const idx = store.customers.findIndex(c => c.id === id);
  if (idx === -1) return null;
  store.customers[idx] = { ...store.customers[idx], ...data };
  if (data.loyaltyPoints !== undefined) {
    store.customers[idx].lastLoyaltyActivity = new Date();
  }
  return store.customers[idx];
}

async function deleteCustomer(id) {
  if (useDb) {
    const res = await Customer.deleteOne({ id });
    return res.deletedCount > 0;
  }
  if (!store.customers) store.customers = [];
  const idx = store.customers.findIndex(c => c.id === id);
  if (idx === -1) return false;
  store.customers.splice(idx, 1);
  return true;
}

async function listPurchaseBills(restaurantId) {
  if (useDb) {
    const query = restaurantId ? { restaurantId } : {};
    const rows = await PurchaseBill.find(query);
    return rows.map(r => ({
      id: r.id,
      restaurantId: r.restaurantId,
      supplierName: r.supplierName,
      supplierGstin: r.supplierGstin || '',
      billNumber: r.billNumber,
      date: r.date,
      items: r.items || [],
      totalAmount: r.totalAmount,
      taxableAmount: r.taxableAmount || r.totalAmount,
      cgst: r.cgst || 0,
      sgst: r.sgst || 0,
      igst: r.igst || 0,
      isItcEligible: !!r.isItcEligible,
      reverseCharge: !!r.reverseCharge,
      paymentMode: r.paymentMode,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
  }
  return (store.purchaseBills || []).filter(p => !restaurantId || p.restaurantId === restaurantId).map(p => ({
    ...p,
    supplierGstin: p.supplierGstin || '',
    taxableAmount: p.taxableAmount || p.totalAmount,
    cgst: p.cgst || 0,
    sgst: p.sgst || 0,
    igst: p.igst || 0,
    isItcEligible: !!p.isItcEligible,
    reverseCharge: !!p.reverseCharge
  }));
}

async function createPurchaseBill(data) {
  const id = uuidv4();
  const dateStr = data.date || new Date().toLocaleDateString('sv');
  
  if (useDb) {
    const bill = new PurchaseBill({
      id,
      restaurantId: data.restaurantId,
      supplierName: data.supplierName,
      supplierGstin: data.supplierGstin || null,
      billNumber: data.billNumber || null,
      date: dateStr,
      items: data.items || [],
      totalAmount: data.totalAmount || 0,
      taxableAmount: data.taxableAmount !== undefined ? data.taxableAmount : data.totalAmount || 0,
      cgst: data.cgst || 0,
      sgst: data.sgst || 0,
      igst: data.igst || 0,
      isItcEligible: !!data.isItcEligible,
      reverseCharge: !!data.reverseCharge,
      paymentMode: data.paymentMode || 'Cash',
      status: data.status || 'paid'
    });
    await bill.save();
    
    // Increment stock quantities in inventory
    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        if (item.inventoryItemId) {
          const invItem = await Inventory.findOne({ id: item.inventoryItemId });
          if (invItem) {
            invItem.quantity = (invItem.quantity || 0) + Number(item.quantity);
            await invItem.save();
          }
        }
      }
    }

    // Automatically create related Expense entry
    await createExpense({
      restaurantId: data.restaurantId,
      amount: data.totalAmount || 0,
      description: `Purchase Bill: ${data.supplierName}${data.billNumber ? ' (' + data.billNumber + ')' : ''}`,
      date: dateStr,
      category: 'Purchase',
      createdBy: 'System'
    });
    
    return {
      id: bill.id,
      restaurantId: bill.restaurantId,
      supplierName: bill.supplierName,
      supplierGstin: bill.supplierGstin,
      billNumber: bill.billNumber,
      date: bill.date,
      items: bill.items,
      totalAmount: bill.totalAmount,
      taxableAmount: bill.taxableAmount,
      cgst: bill.cgst,
      sgst: bill.sgst,
      igst: bill.igst,
      isItcEligible: bill.isItcEligible,
      reverseCharge: bill.reverseCharge,
      paymentMode: bill.paymentMode,
      status: bill.status,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt
    };
  }
  
  if (!store.purchaseBills) store.purchaseBills = [];
  const bill = {
    id,
    restaurantId: data.restaurantId,
    supplierName: data.supplierName,
    supplierGstin: data.supplierGstin || null,
    billNumber: data.billNumber || null,
    date: dateStr,
    items: data.items || [],
    totalAmount: data.totalAmount || 0,
    taxableAmount: data.taxableAmount !== undefined ? data.taxableAmount : data.totalAmount || 0,
    cgst: data.cgst || 0,
    sgst: data.sgst || 0,
    igst: data.igst || 0,
    isItcEligible: !!data.isItcEligible,
    reverseCharge: !!data.reverseCharge,
    paymentMode: data.paymentMode || 'Cash',
    status: data.status || 'paid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.purchaseBills.push(bill);
  
  // Increment in-memory stock quantities
  if (data.items && Array.isArray(data.items)) {
    for (const item of data.items) {
      if (item.inventoryItemId) {
        if (!store.inventory) store.inventory = [];
        const invItem = store.inventory.find(i => i.id === item.inventoryItemId);
        if (invItem) {
          invItem.quantity = (invItem.quantity || 0) + Number(item.quantity);
        }
      }
    }
  }

  // Automatically create related Expense entry in memory
  await createExpense({
    restaurantId: data.restaurantId,
    amount: data.totalAmount || 0,
    description: `Purchase Bill: ${data.supplierName}${data.billNumber ? ' (' + data.billNumber + ')' : ''}`,
    date: dateStr,
    category: 'Purchase',
    createdBy: 'System'
  });
  
  return bill;
}

async function getPurchaseBill(id) {
  if (useDb) {
    const r = await PurchaseBill.findOne({ id });
    if (!r) return null;
    return {
      id: r.id,
      restaurantId: r.restaurantId,
      supplierName: r.supplierName,
      billNumber: r.billNumber,
      date: r.date,
      items: r.items || [],
      totalAmount: r.totalAmount,
      paymentMode: r.paymentMode,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    };
  }
  if (!store.purchaseBills) store.purchaseBills = [];
  return store.purchaseBills.find(p => p.id === id) || null;
}

async function deletePurchaseBill(id) {
  if (useDb) {
    const res = await PurchaseBill.deleteOne({ id });
    return res.deletedCount > 0;
  }
  if (!store.purchaseBills) store.purchaseBills = [];
  const idx = store.purchaseBills.findIndex(p => p.id === id);
  if (idx === -1) return false;
  store.purchaseBills.splice(idx, 1);
  return true;
}

async function cleanDatabase() {
  if (useDb) {
    await Restaurant.deleteMany({});
    await FoodItem.deleteMany({});
    await Expense.deleteMany({});
    await Billing.deleteMany({});
    await User.deleteMany({});
    await Inventory.deleteMany({});
    await Order.deleteMany({});
    await Customer.deleteMany({});
    await Role.deleteMany({});
    await PurchaseBill.deleteMany({});
    await Wastage.deleteMany({});
    await BankTransaction.deleteMany({});

    const superAdminRole = new Role({
      id: 'super-admin-role-id',
      name: 'Super Admin',
      sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'create-order', 'expenses', 'inventory', 'billing', 'users', 'system-status', 'payouts', 'wastage'],
      deleteAccess: true
    });
    const adminRole = new Role({
      id: 'admin-role-id',
      name: 'Admin',
      sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'create-order', 'expenses', 'inventory', 'billing', 'payouts', 'wastage'],
      deleteAccess: false
    });
    await superAdminRole.save();
    await adminRole.save();

    const adminPasswordHash = crypto.createHash('sha256').update('sagar@2410').digest('hex');
    const defaultSuperAdmin = new User({
      id: 'sagar-super-admin-id',
      firstName: 'Sagar',
      lastName: 'Manchadi',
      email: 'sagarmanchadi324@gmail.com',
      password: adminPasswordHash,
      dob: '1995-01-01',
      age: 31,
      role: 'Super Admin'
    });
    await defaultSuperAdmin.save();

    const defaultAdminHash = crypto.createHash('sha256').update('admin123').digest('hex');
    const defaultAdmin = new User({
      id: 'default-admin-id',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: defaultAdminHash,
      dob: '1990-01-01',
      age: 36,
      role: 'Admin'
    });
    await defaultAdmin.save();

    const defaultRest = new Restaurant({
      id: 'default-restaurant-id',
      name: 'Engineering Tadka Main Outlet',
      address: '123 Tech Park, Silicon Valley'
    });
    await defaultRest.save();

    console.log('✅ MongoDB database cleaned and default seeds applied.');
  } else {
    store.restaurants = [
      {
        id: 'default-restaurant-id',
        name: 'Engineering Tadka Main Outlet',
        address: '123 Tech Park, Silicon Valley'
      }
    ];
    store.rooms = [];
    store.bookings = [];
    store.expenses = [];
    store.users = [
      {
        id: 'default-admin-id',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: crypto.createHash('sha256').update('admin123').digest('hex'),
        dob: '1990-01-01',
        age: 36,
        role: 'Admin'
      },
      {
        id: 'sagar-super-admin-id',
        firstName: 'Sagar',
        lastName: 'Manchadi',
        email: 'sagarmanchadi324@gmail.com',
        password: crypto.createHash('sha256').update('sagar@2410').digest('hex'),
        dob: '1995-01-01',
        age: 31,
        role: 'Super Admin'
      }
    ];
    store.roles = [
      {
        id: 'super-admin-role-id',
        name: 'Super Admin',
        sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'expenses', 'inventory', 'billing', 'users', 'system-status', 'payouts', 'wastage'],
        deleteAccess: true
      },
      {
        id: 'admin-role-id',
        name: 'Admin',
        sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'expenses', 'inventory', 'billing', 'payouts', 'wastage'],
        deleteAccess: false
      }
    ];
    store.inventory = [];
    store.orders = [];
    store.customers = [];
    store.food = [];
    store.billing = [];
    store.purchaseBills = [];
    store.payouts = [];
    store.wastages = [];
    store.bankTransactions = [];
    console.log('✅ In-Memory database cleaned and default seeds applied.');
  }
}

async function listPayouts(restaurantId) {
  if (useDb) {
    const query = restaurantId ? { restaurantId } : {};
    const rows = await Payout.find(query);
    return rows.map(r => ({
      id: r.id,
      restaurantId: r.restaurantId,
      platform: r.platform,
      amount: r.amount,
      date: r.date,
      referenceNumber: r.referenceNumber,
      description: r.description,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
  }
  return (store.payouts || []).filter(p => !restaurantId || p.restaurantId === restaurantId);
}

async function createPayout(data) {
  const id = uuidv4();
  if (useDb) {
    const payout = new Payout({
      id,
      restaurantId: data.restaurantId,
      platform: data.platform,
      amount: data.amount,
      date: data.date,
      referenceNumber: data.referenceNumber || null,
      description: data.description || null
    });
    await payout.save();
    return {
      id: payout.id,
      restaurantId: payout.restaurantId,
      platform: payout.platform,
      amount: payout.amount,
      date: payout.date,
      referenceNumber: payout.referenceNumber,
      description: payout.description,
      createdAt: payout.createdAt,
      updatedAt: payout.updatedAt
    };
  }
  if (!store.payouts) store.payouts = [];
  const now = new Date().toISOString();
  const payout = {
    id,
    restaurantId: data.restaurantId,
    platform: data.platform,
    amount: data.amount,
    date: data.date,
    referenceNumber: data.referenceNumber || null,
    description: data.description || null,
    createdAt: now,
    updatedAt: now
  };
  store.payouts.push(payout);
  return payout;
}

async function getPayout(id) {
  if (useDb) {
    const row = await Payout.findOne({ id });
    if (!row) return null;
    return {
      id: row.id,
      restaurantId: row.restaurantId,
      platform: row.platform,
      amount: row.amount,
      date: row.date,
      referenceNumber: row.referenceNumber,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
  if (!store.payouts) store.payouts = [];
  return store.payouts.find(p => p.id === id) || null;
}

async function updatePayout(id, data) {
  if (useDb) {
    const row = await Payout.findOne({ id });
    if (!row) return null;
    if (data.restaurantId !== undefined) row.restaurantId = data.restaurantId;
    if (data.platform !== undefined) row.platform = data.platform;
    if (data.amount !== undefined) row.amount = data.amount;
    if (data.date !== undefined) row.date = data.date;
    if (data.referenceNumber !== undefined) row.referenceNumber = data.referenceNumber;
    if (data.description !== undefined) row.description = data.description;
    await row.save();
    return {
      id: row.id,
      restaurantId: row.restaurantId,
      platform: row.platform,
      amount: row.amount,
      date: row.date,
      referenceNumber: row.referenceNumber,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
  if (!store.payouts) store.payouts = [];
  const idx = store.payouts.findIndex(p => p.id === id);
  if (idx === -1) return null;
  store.payouts[idx] = {
    ...store.payouts[idx],
    ...data,
    updatedAt: new Date().toISOString()
  };
  return store.payouts[idx];
}

async function deletePayout(id) {
  if (useDb) {
    const res = await Payout.deleteOne({ id });
    return res.deletedCount > 0;
  }
  if (!store.payouts) store.payouts = [];
  const idx = store.payouts.findIndex(p => p.id === id);
  if (idx === -1) return false;
  store.payouts.splice(idx, 1);
  return true;
}

module.exports = {
  store,
  cleanDatabase,
  listRestaurants,
  createRestaurant,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  listExpenses,
  createExpense,
  getExpense,
  updateExpense,
  deleteExpense,
  listBillings,
  createBilling,
  getBilling,
  updateBilling,
  deleteBilling,
  listFoodItems,
  createFoodItem,
  getFoodItem,
  updateFoodItem,
  deleteFoodItem,
  listUsers,
  createUser,
  getUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  listRoles,
  createRole,
  getRole,
  getRoleByName,
  updateRole,
  deleteRole,
  listInventory,
  createInventory,
  getInventory,
  updateInventory,
  deleteInventory,
  listOrders,
  createOrder,
  getOrder,
  updateOrder,
  deleteOrder,
  lookupCustomer,
  listCustomers,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  listPurchaseBills,
  createPurchaseBill,
  getPurchaseBill,
  deletePurchaseBill,
  listPayouts,
  createPayout,
  getPayout,
  updatePayout,
  deletePayout,
  listWastage,
  createWastage,
  getWastage,
  updateWastage,
  deleteWastage,
  listRecipes,
  createRecipe,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  seedDefaultRecipes,
  deductInventoryForItems,
  listInventoryDeductions,
  getDailyInventoryReport,
  listBankTransactions,
  createBankTransaction,
  getBankTransaction,
  updateBankTransaction,
  deleteBankTransaction,
  getBankSummary
};

async function listWastage(restaurantId) {
  if (useDb) {
    const query = restaurantId ? { restaurantId } : {};
    const rows = await Wastage.find(query);
    return rows.map(r => ({
      id: r.id,
      restaurantId: r.restaurantId,
      inventoryItemId: r.inventoryItemId,
      inventoryItemName: r.inventoryItemName,
      quantity: r.quantity,
      date: r.date,
      reason: r.reason,
      amount: r.amount,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
  }
  return (store.wastages || []).filter(w => !restaurantId || w.restaurantId === restaurantId);
}

async function createWastage(data) {
  const id = uuidv4();
  
  if (useDb) {
    const invItem = await Inventory.findOne({ id: data.inventoryItemId });
    if (invItem) {
      invItem.quantity = Math.max(0, (invItem.quantity || 0) - Number(data.quantity));
      await invItem.save();
    }
    const item = new Wastage({
      id,
      restaurantId: data.restaurantId,
      inventoryItemId: data.inventoryItemId,
      inventoryItemName: data.inventoryItemName,
      quantity: Number(data.quantity),
      date: data.date,
      reason: data.reason || null,
      amount: Number(data.amount || 0)
    });
    await item.save();
    return {
      id: item.id,
      restaurantId: item.restaurantId,
      inventoryItemId: item.inventoryItemId,
      inventoryItemName: item.inventoryItemName,
      quantity: item.quantity,
      date: item.date,
      reason: item.reason,
      amount: item.amount,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }
  
  if (!store.inventory) store.inventory = [];
  const invItem = store.inventory.find(i => i.id === data.inventoryItemId);
  if (invItem) {
    invItem.quantity = Math.max(0, (invItem.quantity || 0) - Number(data.quantity));
  }
  
  if (!store.wastages) store.wastages = [];
  const now = new Date().toISOString();
  const wastage = {
    id,
    restaurantId: data.restaurantId,
    inventoryItemId: data.inventoryItemId,
    inventoryItemName: data.inventoryItemName,
    quantity: Number(data.quantity),
    date: data.date,
    reason: data.reason || null,
    amount: Number(data.amount || 0),
    createdAt: now,
    updatedAt: now
  };
  store.wastages.push(wastage);
  return wastage;
}

async function getWastage(id) {
  if (useDb) {
    const row = await Wastage.findOne({ id });
    if (!row) return null;
    return {
      id: row.id,
      restaurantId: row.restaurantId,
      inventoryItemId: row.inventoryItemId,
      inventoryItemName: row.inventoryItemName,
      quantity: row.quantity,
      date: row.date,
      reason: row.reason,
      amount: row.amount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
  if (!store.wastages) store.wastages = [];
  return store.wastages.find(w => w.id === id) || null;
}

async function updateWastage(id, data) {
  if (useDb) {
    const row = await Wastage.findOne({ id });
    if (!row) return null;

    const oldQty = row.quantity || 0;
    const newQty = data.quantity !== undefined ? Number(data.quantity) : oldQty;
    const oldItemId = row.inventoryItemId;
    const newItemId = data.inventoryItemId !== undefined ? data.inventoryItemId : oldItemId;

    if (oldItemId === newItemId) {
      const diff = newQty - oldQty;
      if (diff !== 0) {
        const invItem = await Inventory.findOne({ id: oldItemId });
        if (invItem) {
          invItem.quantity = Math.max(0, (invItem.quantity || 0) - diff);
          await invItem.save();
        }
      }
    } else {
      const oldInvItem = await Inventory.findOne({ id: oldItemId });
      if (oldInvItem) {
        oldInvItem.quantity = (oldInvItem.quantity || 0) + oldQty;
        await oldInvItem.save();
      }
      const newInvItem = await Inventory.findOne({ id: newItemId });
      if (newInvItem) {
        newInvItem.quantity = Math.max(0, (newInvItem.quantity || 0) - newQty);
        await newInvItem.save();
      }
    }

    if (data.restaurantId !== undefined) row.restaurantId = data.restaurantId;
    if (data.inventoryItemId !== undefined) row.inventoryItemId = data.inventoryItemId;
    if (data.inventoryItemName !== undefined) row.inventoryItemName = data.inventoryItemName;
    if (data.quantity !== undefined) row.quantity = Number(data.quantity);
    if (data.date !== undefined) row.date = data.date;
    if (data.reason !== undefined) row.reason = data.reason;
    if (data.amount !== undefined) row.amount = Number(data.amount);
    await row.save();
    return {
      id: row.id,
      restaurantId: row.restaurantId,
      inventoryItemId: row.inventoryItemId,
      inventoryItemName: row.inventoryItemName,
      quantity: row.quantity,
      date: row.date,
      reason: row.reason,
      amount: row.amount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }

  if (!store.wastages) store.wastages = [];
  const idx = store.wastages.findIndex(w => w.id === id);
  if (idx === -1) return null;

  const oldW = store.wastages[idx];
  const oldQty = oldW.quantity || 0;
  const newQty = data.quantity !== undefined ? Number(data.quantity) : oldQty;
  const oldItemId = oldW.inventoryItemId;
  const newItemId = data.inventoryItemId !== undefined ? data.inventoryItemId : oldItemId;

  if (!store.inventory) store.inventory = [];
  if (oldItemId === newItemId) {
    const diff = newQty - oldQty;
    if (diff !== 0) {
      const invItem = store.inventory.find(i => i.id === oldItemId);
      if (invItem) {
        invItem.quantity = Math.max(0, (invItem.quantity || 0) - diff);
      }
    }
  } else {
    const oldInvItem = store.inventory.find(i => i.id === oldItemId);
    if (oldInvItem) {
      oldInvItem.quantity = (oldInvItem.quantity || 0) + oldQty;
    }
    const newInvItem = store.inventory.find(i => i.id === newItemId);
    if (newInvItem) {
      newInvItem.quantity = Math.max(0, (newInvItem.quantity || 0) - newQty);
    }
  }

  store.wastages[idx] = {
    ...store.wastages[idx],
    ...data,
    updatedAt: new Date().toISOString()
  };
  return store.wastages[idx];
}

async function deleteWastage(id) {
  if (useDb) {
    const row = await Wastage.findOne({ id });
    if (!row) return false;
    const invItem = await Inventory.findOne({ id: row.inventoryItemId });
    if (invItem) {
      invItem.quantity = (invItem.quantity || 0) + Number(row.quantity);
      await invItem.save();
    }
    const res = await Wastage.deleteOne({ id });
    return res.deletedCount > 0;
  }

  if (!store.wastages) store.wastages = [];
  const idx = store.wastages.findIndex(w => w.id === id);
  if (idx === -1) return false;

  const row = store.wastages[idx];
  if (!store.inventory) store.inventory = [];
  const invItem = store.inventory.find(i => i.id === row.inventoryItemId);
  if (invItem) {
    invItem.quantity = (invItem.quantity || 0) + Number(row.quantity);
  }

  store.wastages.splice(idx, 1);
  return true;
}

const defaultRecipeCatalog = [
  // 1. Sandwiches (Prepared in Sandwich Maker - Oil Free)
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

  // 2. Shawarmas (Microwave / Assembly - Oil Free)
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

  // 3. Sides & Starters (Air Fryer - 100% Oil Free)
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

  // 4. Mains (Induction Cooktop)
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

  // 5. Beverages (Mixer & Induction)
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

  // 6. Value Pre-set Combos
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

async function seedDefaultRecipes(restaurantId) {
  if (!restaurantId) return { count: 0 };
  let count = 0;
  if (useDb) {
    const invItems = await Inventory.find({ restaurantId });
    const foodItems = await FoodItem.find({ restaurantId });

    for (const rDef of defaultRecipeCatalog) {
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
        }
      }

      const existingRecipe = await Recipe.findOne({
        restaurantId,
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
        count++;
      } else {
        const newRecipe = new Recipe({
          id: uuidv4(),
          restaurantId,
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
        count++;
      }
    }
    return { count, message: `Successfully synced ${count} recipes` };
  }

  if (!store.recipes) store.recipes = [];
  return { count: store.recipes.length, message: `In-memory recipes ready` };
}

async function listRecipes(restaurantId) {
  if (useDb) {
    const query = restaurantId ? { restaurantId } : {};
    const rows = await Recipe.find(query).sort({ createdAt: -1 });
    return rows.map(r => ({
      id: r.id,
      restaurantId: r.restaurantId,
      dishName: r.dishName,
      dishId: r.dishId,
      category: r.category,
      appliance: r.appliance,
      yieldPortions: r.yieldPortions || 1,
      ingredients: r.ingredients || [],
      notes: r.notes,
      isActive: r.isActive !== undefined ? r.isActive : true,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
  }
  if (!store.recipes) store.recipes = [];
  return store.recipes.filter(r => !restaurantId || r.restaurantId === restaurantId);
}

async function createRecipe(data) {
  const id = uuidv4();
  if (useDb) {
    const recipe = new Recipe({
      id,
      restaurantId: data.restaurantId,
      dishName: data.dishName,
      dishId: data.dishId || null,
      category: data.category || 'General',
      appliance: data.appliance || 'Assembly',
      yieldPortions: data.yieldPortions || 1,
      ingredients: data.ingredients || [],
      notes: data.notes || null,
      isActive: data.isActive !== undefined ? data.isActive : true
    });
    await recipe.save();
    return {
      id: recipe.id,
      restaurantId: recipe.restaurantId,
      dishName: recipe.dishName,
      dishId: recipe.dishId,
      category: recipe.category,
      appliance: recipe.appliance,
      yieldPortions: recipe.yieldPortions,
      ingredients: recipe.ingredients,
      notes: recipe.notes,
      isActive: recipe.isActive,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt
    };
  }
  if (!store.recipes) store.recipes = [];
  const now = new Date().toISOString();
  const recipe = {
    id,
    restaurantId: data.restaurantId,
    dishName: data.dishName,
    dishId: data.dishId || null,
    category: data.category || 'General',
    appliance: data.appliance || 'Assembly',
    yieldPortions: data.yieldPortions || 1,
    ingredients: data.ingredients || [],
    notes: data.notes || null,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: now,
    updatedAt: now
  };
  store.recipes.push(recipe);
  return recipe;
}

async function getRecipe(id) {
  if (useDb) {
    const r = await Recipe.findOne({ id });
    if (!r) return null;
    return {
      id: r.id,
      restaurantId: r.restaurantId,
      dishName: r.dishName,
      dishId: r.dishId,
      category: r.category,
      appliance: r.appliance,
      yieldPortions: r.yieldPortions,
      ingredients: r.ingredients || [],
      notes: r.notes,
      isActive: r.isActive,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    };
  }
  if (!store.recipes) store.recipes = [];
  return store.recipes.find(r => r.id === id) || null;
}

async function updateRecipe(id, data) {
  if (useDb) {
    const row = await Recipe.findOne({ id });
    if (!row) return null;
    if (data.dishName !== undefined) row.dishName = data.dishName;
    if (data.dishId !== undefined) row.dishId = data.dishId;
    if (data.category !== undefined) row.category = data.category;
    if (data.appliance !== undefined) row.appliance = data.appliance;
    if (data.yieldPortions !== undefined) row.yieldPortions = data.yieldPortions;
    if (data.ingredients !== undefined) row.ingredients = data.ingredients;
    if (data.notes !== undefined) row.notes = data.notes;
    if (data.isActive !== undefined) row.isActive = data.isActive;
    await row.save();
    return {
      id: row.id,
      restaurantId: row.restaurantId,
      dishName: row.dishName,
      dishId: row.dishId,
      category: row.category,
      appliance: row.appliance,
      yieldPortions: row.yieldPortions,
      ingredients: row.ingredients,
      notes: row.notes,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
  if (!store.recipes) store.recipes = [];
  const idx = store.recipes.findIndex(r => r.id === id);
  if (idx === -1) return null;
  store.recipes[idx] = {
    ...store.recipes[idx],
    ...data,
    updatedAt: new Date().toISOString()
  };
  return store.recipes[idx];
}

async function deleteRecipe(id) {
  if (useDb) {
    const res = await Recipe.deleteOne({ id });
    return res.deletedCount > 0;
  }
  if (!store.recipes) store.recipes = [];
  const idx = store.recipes.findIndex(r => r.id === id);
  if (idx === -1) return false;
  store.recipes.splice(idx, 1);
  return true;
}

async function deductInventoryForItems(restaurantId, items, refId, refType, dateStr) {
  // TEMPORARILY DISABLED: Bypass inventory deduction until accurate inventory items and recipes are fully set up.
  return;

  if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) return;
  const dateVal = dateStr || new Date().toLocaleDateString('sv');

  for (const item of items) {
    const itemName = item.name || item.dishName || item.foodName;
    const itemQty = Number(item.quantity || 1);
    if (!itemName || itemQty <= 0) continue;

    let recipe = null;
    if (useDb) {
      recipe = await Recipe.findOne({
        restaurantId,
        dishName: { $regex: new RegExp(`^${itemName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
        isActive: true
      });
      if (!recipe) {
        // Try cleaned name without brackets (e.g. "Dahi Kebab (6pc)" matches "Dahi Kebab")
        const cleanItemName = itemName.replace(/\s*\([^)]*\)/g, '').trim();
        recipe = await Recipe.findOne({
          restaurantId,
          $or: [
            { dishName: { $regex: new RegExp(`^${cleanItemName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i') } },
            { dishName: { $regex: new RegExp(`${cleanItemName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i') } }
          ],
          isActive: true
        });
      }
      if (!recipe && (item.id || item.foodItemId)) {
        recipe = await Recipe.findOne({
          restaurantId,
          dishId: item.id || item.foodItemId,
          isActive: true
        });
      }
    } else {
      if (!store.recipes) store.recipes = [];
      const cleanItemName = itemName.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
      recipe = store.recipes.find(r => (!r.restaurantId || r.restaurantId === restaurantId) && 
        (r.dishName.toLowerCase() === itemName.toLowerCase() || r.dishName.toLowerCase().startsWith(cleanItemName) || cleanItemName.startsWith(r.dishName.toLowerCase())) && 
        r.isActive !== false);
    }

    if (recipe && recipe.ingredients && Array.isArray(recipe.ingredients)) {
      const portions = Number(recipe.yieldPortions || 1);
      for (const ing of recipe.ingredients) {
        const deductQty = (Number(ing.quantity || 0) / portions) * itemQty;
        if (deductQty <= 0) continue;

        if (useDb) {
          let inv = null;
          if (ing.inventoryItemId) {
            inv = await Inventory.findOne({ id: ing.inventoryItemId, restaurantId });
          }
          if (!inv && ing.inventoryItemName) {
            inv = await Inventory.findOne({
              restaurantId,
              name: { $regex: new RegExp(`^${ing.inventoryItemName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
            });
          }

          if (inv) {
            inv.quantity = Math.max(0, Math.round(((inv.quantity || 0) - deductQty) * 1000) / 1000);
            await inv.save();

            const deductionLog = new InventoryDeduction({
              id: uuidv4(),
              restaurantId,
              date: dateVal,
              orderId: refType === 'order' ? refId : null,
              billId: refType === 'billing' ? refId : null,
              dishName: recipe.dishName || itemName,
              inventoryItemId: inv.id,
              inventoryItemName: inv.name,
              quantity: Math.round(deductQty * 1000) / 1000,
              unit: inv.unit || ing.unit || 'units',
              source: refType || 'order'
            });
            await deductionLog.save();
          }
        } else {
          if (!store.inventory) store.inventory = [];
          if (!store.inventoryDeductions) store.inventoryDeductions = [];

          const inv = store.inventory.find(i => (!i.restaurantId || i.restaurantId === restaurantId) && (i.id === ing.inventoryItemId || i.name.toLowerCase() === (ing.inventoryItemName || '').toLowerCase()));
          if (inv) {
            inv.quantity = Math.max(0, Math.round(((inv.quantity || 0) - deductQty) * 1000) / 1000);
            store.inventoryDeductions.push({
              id: uuidv4(),
              restaurantId,
              date: dateVal,
              orderId: refType === 'order' ? refId : null,
              billId: refType === 'billing' ? refId : null,
              dishName: recipe.dishName || itemName,
              inventoryItemId: inv.id,
              inventoryItemName: inv.name,
              quantity: Math.round(deductQty * 1000) / 1000,
              unit: inv.unit || ing.unit || 'units',
              source: refType || 'order',
              createdAt: new Date().toISOString()
            });
          }
        }
      }
    }
  }
}

async function listInventoryDeductions(restaurantId, date) {
  const dateVal = date || new Date().toLocaleDateString('sv');
  if (useDb) {
    const query = { restaurantId, date: dateVal };
    const rows = await InventoryDeduction.find(query).sort({ createdAt: -1 });
    return rows.map(r => ({
      id: r.id,
      restaurantId: r.restaurantId,
      date: r.date,
      orderId: r.orderId,
      billId: r.billId,
      dishName: r.dishName,
      inventoryItemId: r.inventoryItemId,
      inventoryItemName: r.inventoryItemName,
      quantity: r.quantity,
      unit: r.unit,
      source: r.source,
      createdAt: r.createdAt
    }));
  }
  if (!store.inventoryDeductions) store.inventoryDeductions = [];
  return store.inventoryDeductions.filter(d => (!restaurantId || d.restaurantId === restaurantId) && d.date === dateVal);
}

async function getDailyInventoryReport(restaurantId, date) {
  const dateVal = date || new Date().toLocaleDateString('sv');
  
  if (useDb) {
    const inventoryList = await Inventory.find(restaurantId ? { restaurantId } : {});
    const purchaseBills = await PurchaseBill.find({ restaurantId, date: dateVal });
    const deductions = await InventoryDeduction.find({ restaurantId, date: dateVal });
    const wastages = await Wastage.find({ restaurantId, date: dateVal });

    // Aggregate purchases per item
    const purchaseMap = {};
    for (const pb of purchaseBills) {
      if (pb.items && Array.isArray(pb.items)) {
        for (const it of pb.items) {
          const key = it.inventoryItemId || (it.name || '').toLowerCase();
          purchaseMap[key] = (purchaseMap[key] || 0) + Number(it.quantity || 0);
        }
      }
    }

    // Aggregate deductions per item
    const deductionMap = {};
    for (const d of deductions) {
      const key = d.inventoryItemId || (d.inventoryItemName || '').toLowerCase();
      deductionMap[key] = (deductionMap[key] || 0) + Number(d.quantity || 0);
    }

    // Aggregate wastage per item
    const wastageMap = {};
    for (const w of wastages) {
      const key = w.inventoryItemId || (w.inventoryItemName || '').toLowerCase();
      wastageMap[key] = (wastageMap[key] || 0) + Number(w.quantity || 0);
    }

    let healthyCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalPurchasesSum = 0;
    let totalDeductionsSum = 0;
    let totalWastageSum = 0;

    const itemsReport = inventoryList.map(inv => {
      const purchased = purchaseMap[inv.id] || purchaseMap[inv.name.toLowerCase()] || 0;
      const deducted = deductionMap[inv.id] || deductionMap[inv.name.toLowerCase()] || 0;
      const wasted = wastageMap[inv.id] || wastageMap[inv.name.toLowerCase()] || 0;
      const closingStock = Math.round((inv.quantity || 0) * 1000) / 1000;
      const openingStock = Math.max(0, Math.round((closingStock - purchased + deducted + wasted) * 1000) / 1000);
      const threshold = inv.threshold !== undefined ? inv.threshold : 10;

      let status = 'healthy';
      if (closingStock <= 0) {
        status = 'out';
        outOfStockCount++;
      } else if (closingStock <= threshold) {
        status = 'low';
        lowStockCount++;
      } else {
        healthyCount++;
      }

      totalPurchasesSum += purchased;
      totalDeductionsSum += deducted;
      totalWastageSum += wasted;

      return {
        id: inv.id,
        name: inv.name,
        unit: inv.unit || 'units',
        threshold,
        openingStock,
        purchased: Math.round(purchased * 1000) / 1000,
        deducted: Math.round(deducted * 1000) / 1000,
        wasted: Math.round(wasted * 1000) / 1000,
        closingStock,
        status
      };
    });

    return {
      date: dateVal,
      restaurantId,
      summary: {
        totalItemsCount: itemsReport.length,
        healthyCount,
        lowStockCount,
        outOfStockCount,
        totalPurchasesSum: Math.round(totalPurchasesSum * 1000) / 1000,
        totalDeductionsSum: Math.round(totalDeductionsSum * 1000) / 1000,
        totalWastageSum: Math.round(totalWastageSum * 1000) / 1000
      },
      items: itemsReport,
      deductionLogs: deductions.map(d => ({
        id: d.id,
        dishName: d.dishName,
        inventoryItemName: d.inventoryItemName,
        quantity: d.quantity,
        unit: d.unit,
        source: d.source,
        orderId: d.orderId,
        createdAt: d.createdAt
      }))
    };
  }

  // in-memory fallback
  const invList = (store.inventory || []).filter(i => !restaurantId || i.restaurantId === restaurantId);
  return {
    date: dateVal,
    restaurantId,
    summary: { totalItemsCount: invList.length, healthyCount: invList.length, lowStockCount: 0, outOfStockCount: 0, totalPurchasesSum: 0, totalDeductionsSum: 0, totalWastageSum: 0 },
    items: invList.map(i => ({ id: i.id, name: i.name, unit: i.unit || 'units', threshold: i.threshold || 10, openingStock: i.quantity || 0, purchased: 0, deducted: 0, wasted: 0, closingStock: i.quantity || 0, status: (i.quantity || 0) <= 0 ? 'out' : ((i.quantity || 0) <= (i.threshold || 10) ? 'low' : 'healthy') })),
    deductionLogs: []
  };
}

// =========================================================================
// BANK TRANSACTIONS & TREASURY
// =========================================================================
function mapBankTransaction(b) {
  return {
    id: b.id,
    restaurantId: b.restaurantId,
    type: b.type,
    amount: b.amount,
    date: b.date,
    source: b.source,
    description: b.description,
    referenceNumber: b.referenceNumber,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt
  };
}

async function listBankTransactions(restaurantId, filter = {}) {
  if (useDb) {
    const query = {};
    if (restaurantId) query.restaurantId = restaurantId;
    if (filter.type) query.type = filter.type;
    if (filter.type && filter.type !== 'all') query.type = filter.type;
    if (filter.startDate || filter.endDate) {
      query.date = {};
      if (filter.startDate) query.date.$gte = filter.startDate;
      if (filter.endDate) query.date.$lte = filter.endDate;
    }
    const rows = await BankTransaction.find(query).sort({ date: -1, createdAt: -1 });
    return rows.map(mapBankTransaction);
  }
  if (!store.bankTransactions) store.bankTransactions = [];
  return store.bankTransactions
    .filter(b => {
      if (restaurantId && b.restaurantId !== restaurantId) return false;
      if (filter.type && filter.type !== 'all' && b.type !== filter.type) return false;
      if (filter.startDate && b.date < filter.startDate) return false;
      if (filter.endDate && b.date > filter.endDate) return false;
      return true;
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

async function createBankTransaction(data) {
  const id = uuidv4();
  const txData = {
    id,
    restaurantId: data.restaurantId || 'default-restaurant-id',
    type: data.type || 'deposit',
    amount: Number(data.amount || 0),
    date: data.date || new Date().toISOString().split('T')[0],
    source: data.source || (data.type === 'opening_balance' ? 'Opening Balance' : (data.type === 'deduction' ? 'Account Withdrawal' : 'Deposit')),
    description: data.description || '',
    referenceNumber: data.referenceNumber || null
  };
  if (useDb) {
    const tx = new BankTransaction(txData);
    await tx.save();
    return mapBankTransaction(tx);
  }
  if (!store.bankTransactions) store.bankTransactions = [];
  store.bankTransactions.push(txData);
  return mapBankTransaction(txData);
}

async function getBankTransaction(id) {
  if (useDb) {
    const mongoose = require('mongoose');
    const conditions = [{ id: String(id) }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      conditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }
    const row = await BankTransaction.findOne({ $or: conditions });
    return row ? mapBankTransaction(row) : null;
  }
  if (!store.bankTransactions) store.bankTransactions = [];
  const found = store.bankTransactions.find(b => b.id === id);
  return found ? mapBankTransaction(found) : null;
}

async function updateBankTransaction(id, data) {
  if (useDb) {
    const mongoose = require('mongoose');
    const updateData = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.amount !== undefined) updateData.amount = Number(data.amount);
    if (data.date !== undefined) updateData.date = data.date;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.referenceNumber !== undefined) updateData.referenceNumber = data.referenceNumber;
    if (data.restaurantId !== undefined) updateData.restaurantId = data.restaurantId;

    const conditions = [{ id: String(id) }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      conditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }
    const row = await BankTransaction.findOneAndUpdate({ $or: conditions }, { $set: updateData }, { new: true });
    return row ? mapBankTransaction(row) : null;
  }
  if (!store.bankTransactions) store.bankTransactions = [];
  const idx = store.bankTransactions.findIndex(b => b.id === id);
  if (idx === -1) return null;
  const current = store.bankTransactions[idx];
  store.bankTransactions[idx] = {
    ...current,
    ...data,
    amount: data.amount !== undefined ? Number(data.amount) : current.amount
  };
  return mapBankTransaction(store.bankTransactions[idx]);
}

async function deleteBankTransaction(id) {
  if (useDb) {
    const mongoose = require('mongoose');
    const conditions = [{ id: String(id) }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      conditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }
    const res = await BankTransaction.deleteOne({ $or: conditions });
    return res.deletedCount > 0;
  }
  if (!store.bankTransactions) store.bankTransactions = [];
  const idx = store.bankTransactions.findIndex(b => b.id === id);
  if (idx === -1) return false;
  store.bankTransactions.splice(idx, 1);
  return true;
}

async function getBankSummary(restaurantId, startDate, endDate) {
  // 1. Fetch Bank Transactions
  const bankQuery = {};
  if (restaurantId) bankQuery.restaurantId = restaurantId;
  let bankRows = [];
  if (useDb) {
    bankRows = await BankTransaction.find(bankQuery);
  } else {
    bankRows = (store.bankTransactions || []).filter(b => !restaurantId || b.restaurantId === restaurantId);
  }

  // Find latest opening balance to determine cutoff date (do not calculate prior transactions)
  const openingTransactions = bankRows
    .filter(b => b.type === 'opening_balance')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  
  const latestOpeningTx = openingTransactions.length > 0 ? openingTransactions[0] : null;
  const cutoffDate = latestOpeningTx && latestOpeningTx.date ? latestOpeningTx.date.substring(0, 10) : '';

  let openingBalance = 0;
  let otherDeposits = 0;
  let totalDeductions = 0;

  for (const b of bankRows) {
    const d = (b.date || '').substring(0, 10);
    const amt = Number(b.amount || 0);

    if (b.type === 'opening_balance') {
      if (!cutoffDate || d === cutoffDate) {
        openingBalance += amt;
      }
    } else {
      // Don't take back entries for calculations
      if (cutoffDate && d < cutoffDate) continue;

      if (b.type === 'deduction') {
        totalDeductions += amt;
      } else if (b.type === 'deposit') {
        otherDeposits += amt;
      }
    }
  }

  // 2. Fetch Payouts (Swiggy / Zomato)
  let payoutRows = [];
  const payoutQuery = restaurantId ? { restaurantId } : {};
  if (useDb) {
    payoutRows = await Payout.find(payoutQuery);
  } else {
    payoutRows = (store.payouts || []).filter(p => !restaurantId || p.restaurantId === restaurantId);
  }

  let swiggyTotal = 0;
  let zomatoTotal = 0;
  for (const p of payoutRows) {
    const d = (p.date || '').substring(0, 10);
    // Don't take back entries for calculations
    if (cutoffDate && d < cutoffDate) continue;

    const amt = Number(p.amount || 0);
    if ((p.platform || '').toLowerCase() === 'swiggy') {
      swiggyTotal += amt;
    } else if ((p.platform || '').toLowerCase() === 'zomato') {
      zomatoTotal += amt;
    }
  }

  // 3. Fetch UPI Collections from Billing
  let billRows = [];
  const billQuery = restaurantId ? { restaurantId } : {};
  if (useDb) {
    billRows = await Billing.find(billQuery);
  } else {
    billRows = (store.billings || []).filter(b => !restaurantId || b.restaurantId === restaurantId);
  }

  let upiOrdersTotal = 0;
  for (const b of billRows) {
    const d = (b.date || '').substring(0, 10);
    // Don't take back entries for calculations
    if (cutoffDate && d < cutoffDate) continue;

    const grandTotal = (b.amount || 0) + (b.cgst || 0) + (b.sgst || 0);
    const hasSplit = (b.cashAmount !== undefined && b.cashAmount > 0) || (b.upiAmount !== undefined && b.upiAmount > 0);
    if (hasSplit) {
      upiOrdersTotal += (b.upiAmount || 0);
    } else if ((b.paymentMode || '').toLowerCase() === 'upi') {
      upiOrdersTotal += grandTotal;
    }
  }

  const currentBalance = Math.round((openingBalance + upiOrdersTotal + swiggyTotal + zomatoTotal + otherDeposits - totalDeductions) * 100) / 100;

  return {
    currentBalance,
    effectiveOpeningDate: cutoffDate || null,
    openingBalance: Math.round(openingBalance * 100) / 100,
    upiOrdersTotal: Math.round(upiOrdersTotal * 100) / 100,
    swiggyTotal: Math.round(swiggyTotal * 100) / 100,
    zomatoTotal: Math.round(zomatoTotal * 100) / 100,
    otherDeposits: Math.round(otherDeposits * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    totalInflows: Math.round((openingBalance + upiOrdersTotal + swiggyTotal + zomatoTotal + otherDeposits) * 100) / 100,
    transactionsCount: bankRows.length + payoutRows.length
  };
}
