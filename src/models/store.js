// Simple store with optional MongoDB persistence via mongoose
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const useDb = process.env.USE_DB === 'true';

let Restaurant, FoodItem, Expense, Billing, User, Inventory, Order, Customer, Role;

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
          sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'expenses', 'inventory', 'billing', 'users', 'system-status'],
          deleteAccess: true
        });
        const adminRole = new Role({
          id: 'admin-role-id',
          name: 'Admin',
          sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'expenses', 'inventory', 'billing'],
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
        console.log('✅ Seeded default Super Admin: sagarmanchadi324@gmail.com / sagar@2410');
      } else {
        superAdminUser.password = adminPasswordHash;
        await superAdminUser.save();
        console.log('✅ Updated default Super Admin password: sagarmanchadi324@gmail.com / sagar@2410');
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
          { id: 'item-1', name: 'Paneer Shawarma', price: 100, category: 'Starters', description: 'Fresh paneer shawarma roll', restaurantId: 'default-restaurant-id' },
          { id: 'item-2', name: 'Peri Peri Paneer Shawarma', price: 110, category: 'Starters', description: 'Spicy peri peri paneer shawarma', restaurantId: 'default-restaurant-id' },
          { id: 'item-3', name: 'Cheesy Paneer Shawarma', price: 110, category: 'Starters', description: 'Cheesy loaded paneer shawarma', restaurantId: 'default-restaurant-id' },
          { id: 'item-4', name: 'Hariyali Paneer Shawarma', price: 120, category: 'Starters', description: 'Green herbs spiced paneer shawarma', restaurantId: 'default-restaurant-id' },
          { id: 'item-5', name: 'Malai Paneer Shawarma', price: 140, category: 'Starters', description: 'Rich malai paneer shawarma', restaurantId: 'default-restaurant-id' },
          { id: 'item-6', name: 'French Fries', price: 70, category: 'Starters', description: 'Crispy salted french fries', restaurantId: 'default-restaurant-id' },
          { id: 'item-7', name: 'Cheese French Fries', price: 90, category: 'Starters', description: 'French fries with melted cheese sauce', restaurantId: 'default-restaurant-id' },
          { id: 'item-8', name: 'Dahi Kebab (6PC)', price: 90, category: 'Starters', description: 'Creamy hung curd and spices kebabs', restaurantId: 'default-restaurant-id' },
          { id: 'item-9', name: 'Paneer Tikka (6PC)', price: 160, category: 'Starters', description: 'Tandoori grilled paneer chunks', restaurantId: 'default-restaurant-id' },
          { id: 'item-10', name: 'Masala Maggie', price: 60, category: 'Main Course', description: 'Classic Indian spiced instant noodles', restaurantId: 'default-restaurant-id' },
          { id: 'item-11', name: 'Masala Chai', price: 30, category: 'Beverages', description: 'Authentic Indian spiced milk tea', restaurantId: 'default-restaurant-id' },
          { id: 'item-12', name: 'Cold Drinks', price: 40, category: 'Beverages', description: 'Assorted soft drinks (MRP)', restaurantId: 'default-restaurant-id' },
          { id: 'item-13', name: 'Pepsi', price: 40, category: 'Beverages', description: 'Cold pepsi can', restaurantId: 'default-restaurant-id' },
          { id: 'item-14', name: '7up', price: 40, category: 'Beverages', description: 'Cold 7up can', restaurantId: 'default-restaurant-id' },
          { id: 'item-15', name: 'Chicken Shawarma', price: 100, category: 'Starters', description: 'Grilled chicken shawarma roll', restaurantId: 'default-restaurant-id' },
          { id: 'item-16', name: 'Peri Peri Chicken Shawarma', price: 110, category: 'Starters', description: 'Spicy peri peri chicken shawarma', restaurantId: 'default-restaurant-id' },
          { id: 'item-17', name: 'Cheesy Chicken Shawarma', price: 110, category: 'Starters', description: 'Cheesy loaded chicken shawarma', restaurantId: 'default-restaurant-id' },
          { id: 'item-18', name: 'Hariyali Chicken Shawarma', price: 120, category: 'Starters', description: 'Green herbs spiced chicken shawarma', restaurantId: 'default-restaurant-id' },
          { id: 'item-19', name: 'Malai Chicken Shawarma', price: 140, category: 'Starters', description: 'Rich malai chicken shawarma', restaurantId: 'default-restaurant-id' },
          { id: 'item-20', name: 'Chicken Drumstick (2PC)', price: 150, category: 'Starters', description: 'Crispy fried chicken drumsticks', restaurantId: 'default-restaurant-id' },
          { id: 'item-21', name: 'Chicken Dum Biryani', price: 200, category: 'Main Course', description: 'Flavorful spiced basmati rice with chicken', restaurantId: 'default-restaurant-id' },
          { id: 'item-22', name: 'Chicken Sev Puri', price: 80, category: 'Starters', description: 'Chicken sev puri style starter', restaurantId: 'default-restaurant-id' }
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
    address: { type: String }
  }, { timestamps: true, id: false });

  const FoodItemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String }
  }, { timestamps: true, id: false });

  const ExpenseSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: String },
    category: { type: String }
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
    discount: { type: Number, default: 0 }
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
    name: { type: String, required: true }
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
    orderType: { type: String, default: 'dinein' }
  }, { timestamps: true, id: false });

  const CustomerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    mobile: { type: String, unique: true, sparse: true },
    emailId: { type: String, sparse: true },
    loyaltyPoints: { type: Number, default: 0 },
    lastLoyaltyActivity: { type: Date, default: Date.now }
  }, { timestamps: true, id: false });

  Restaurant = mongoose.model('Restaurant', RestaurantSchema);
  FoodItem = mongoose.model('FoodItem', FoodItemSchema);
  Expense = mongoose.model('Expense', ExpenseSchema);
  Billing = mongoose.model('Billing', BillingSchema);
  User = mongoose.model('User', UserSchema);
  Inventory = mongoose.model('Inventory', InventorySchema);
  Order = mongoose.model('Order', OrderSchema);
  Customer = mongoose.model('Customer', CustomerSchema);
  Role = mongoose.model('Role', RoleSchema);
}

const store = {
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
      sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'expenses', 'inventory', 'billing', 'users', 'system-status'],
      deleteAccess: true
    },
    {
      id: 'admin-role-id',
      name: 'Admin',
      sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'expenses', 'inventory', 'billing'],
      deleteAccess: false
    }
  ],
  inventory: [],
  orders: [],
  customers: []
};

async function listFoodItems(restaurantId) {
  if (useDb) {
    const query = restaurantId ? { restaurantId } : {};
    const items = await FoodItem.find(query);
    return items.map(r => ({ id: r.id, restaurantId: r.restaurantId, name: r.name, price: r.price, description: r.description, category: r.category }));
  }
  return (store.foodItems || []).filter(f => !restaurantId || f.restaurantId === restaurantId);
}

async function createFoodItem(data) {
  const id = uuidv4();
  if (useDb) {
    const item = new FoodItem({
      id,
      restaurantId: data.restaurantId,
      name: data.name,
      price: data.price,
      description: data.description || null,
      category: data.category || null
    });
    await item.save();
    return { id: item.id, restaurantId: item.restaurantId, name: item.name, price: item.price, description: item.description, category: item.category };
  }
  if (!store.foodItems) store.foodItems = [];
  const item = {
    id,
    restaurantId: data.restaurantId,
    name: data.name,
    price: data.price,
    description: data.description || null,
    category: data.category || null
  };
  store.foodItems.push(item);
  return item;
}

async function getFoodItem(id) {
  if (useDb) {
    const item = await FoodItem.findOne({ id });
    if (!item) return null;
    return { id: item.id, restaurantId: item.restaurantId, name: item.name, price: item.price, description: item.description, category: item.category };
  }
  if (!store.foodItems) store.foodItems = [];
  return store.foodItems.find(f => f.id === id) || null;
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
    await item.save();
    return { id: item.id, restaurantId: item.restaurantId, name: item.name, price: item.price, description: item.description, category: item.category };
  }
  if (!store.foodItems) store.foodItems = [];
  const idx = store.foodItems.findIndex(f => f.id === id);
  if (idx === -1) return null;
  store.foodItems[idx] = { ...store.foodItems[idx], ...data };
  return store.foodItems[idx];
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

async function listBillings(restaurantId) {
  if (useDb) {
    const query = restaurantId ? { restaurantId } : {};
    const rows = await Billing.find(query);
    return rows.map(r => ({ id: r.id, amount: r.amount, restaurantId: r.restaurantId, date: r.date, description: r.description, status: r.status, mobile: r.mobile, emailId: r.emailId, cgst: r.cgst, sgst: r.sgst, foodItems: r.foodItems || [], orderNumber: r.orderNumber, discount: r.discount || 0 }));
  }
  return (store.billings || []).filter(b => !restaurantId || b.restaurantId === restaurantId);
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
      discount: data.discount || 0
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

    return { id: billing.id, amount: billing.amount, restaurantId: billing.restaurantId, date: billing.date, description: billing.description, status: billing.status, mobile: billing.mobile, emailId: billing.emailId, cgst: billing.cgst, sgst: billing.sgst, foodItems: billing.foodItems, orderNumber: billing.orderNumber, discount: billing.discount || 0 };
  }
  if (!store.billings) store.billings = [];
  const billing = { id, amount: data.amount, restaurantId: data.restaurantId || null, date: data.date || null, description: data.description || null, status: data.status || 'pending', mobile: data.mobile || null, emailId: data.emailId || null, cgst: data.cgst || 0, sgst: data.sgst || 0, foodItems: data.foodItems || [], orderNumber: data.orderNumber || null, discount: data.discount || 0 };
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
    return { id: row.id, amount: row.amount, restaurantId: row.restaurantId, date: row.date, description: row.description, status: row.status, mobile: row.mobile, emailId: row.emailId, cgst: row.cgst, sgst: row.sgst, foodItems: row.foodItems || [], orderNumber: row.orderNumber, discount: row.discount || 0 };
  }
  if (!store.billings) store.billings = [];
  return store.billings.find(b => b.id === id) || null;
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
    await row.save();
    return { id: row.id, amount: row.amount, restaurantId: row.restaurantId, date: row.date, description: row.description, status: row.status, mobile: row.mobile, emailId: row.emailId, cgst: row.cgst, sgst: row.sgst, foodItems: row.foodItems || [], orderNumber: row.orderNumber, discount: row.discount || 0 };
  }
  if (!store.billings) store.billings = [];
  const idx = store.billings.findIndex(b => b.id === id);
  if (idx === -1) return null;
  store.billings[idx] = { ...store.billings[idx], ...data };
  return store.billings[idx];
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
    return rows.map(r => ({ id: r.id, restaurantId: r.restaurantId, amount: r.amount, description: r.description, date: r.date, category: r.category }));
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
      category: data.category || null
    });
    await expense.save();
    return { id: expense.id, restaurantId: expense.restaurantId, amount: expense.amount, description: expense.description, date: expense.date, category: expense.category };
  }
  if (!store.expenses) store.expenses = [];
  const expense = {
    id,
    restaurantId: data.restaurantId,
    amount: data.amount,
    description: data.description || null,
    date: data.date || null,
    category: data.category || null
  };
  store.expenses.push(expense);
  return expense;
}

async function getExpense(id) {
  if (useDb) {
    const row = await Expense.findOne({ id });
    if (!row) return null;
    return { id: row.id, restaurantId: row.restaurantId, amount: row.amount, description: row.description, date: row.date, category: row.category };
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
    await row.save();
    return { id: row.id, restaurantId: row.restaurantId, amount: row.amount, description: row.description, date: row.date, category: row.category };
  }
  if (!store.expenses) store.expenses = [];
  const idx = store.expenses.findIndex(e => e.id === id);
  if (idx === -1) return null;
  store.expenses[idx] = { ...store.expenses[idx], ...data };
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
    return rows.map(r => ({ id: r.id, name: r.name, address: r.address }));
  }
  return store.restaurants || [];
}

async function createRestaurant(data) {
  const id = uuidv4();
  if (useDb) {
    const restaurant = new Restaurant({ id, name: data.name, address: data.address || null });
    await restaurant.save();
    return { id: restaurant.id, name: restaurant.name, address: restaurant.address };
  }
  if (!store.restaurants) store.restaurants = [];
  const restaurant = { id, name: data.name, address: data.address || null };
  store.restaurants.push(restaurant);
  return restaurant;
}

async function getRestaurant(id) {
  if (useDb) {
    const row = await Restaurant.findOne({ id });
    if (!row) return null;
    return { id: row.id, name: row.name, address: row.address };
  }
  if (!store.restaurants) store.restaurants = [];
  return store.restaurants.find(h => h.id === id) || null;
}

async function updateRestaurant(id, data) {
  if (useDb) {
    const row = await Restaurant.findOne({ id });
    if (!row) return null;
    if (data.name !== undefined) row.name = data.name;
    if (data.address !== undefined) row.address = data.address;
    await row.save();
    return { id: row.id, name: row.name, address: row.address };
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
    return rows.map(r => ({ id: r.id, restaurantId: r.restaurantId, name: r.name }));
  }
  return (store.inventory || []).filter(i => !restaurantId || i.restaurantId === restaurantId);
}

async function createInventory(data) {
  const id = uuidv4();
  if (useDb) {
    const item = new Inventory({ id, restaurantId: data.restaurantId, name: data.name });
    await item.save();
    return { id: item.id, restaurantId: item.restaurantId, name: item.name };
  }
  if (!store.inventory) store.inventory = [];
  const item = { id, restaurantId: data.restaurantId, name: data.name };
  store.inventory.push(item);
  return item;
}

async function getInventory(id) {
  if (useDb) {
    const row = await Inventory.findOne({ id });
    if (!row) return null;
    return { id: row.id, restaurantId: row.restaurantId, name: row.name };
  }
  if (!store.inventory) store.inventory = [];
  return store.inventory.find(i => i.id === id) || null;
}

async function updateInventory(id, data) {
  if (useDb) {
    const row = await Inventory.findOne({ id });
    if (!row) return null;
    if (data.name !== undefined) row.name = data.name;
    if (data.restaurantId !== undefined) row.restaurantId = data.restaurantId;
    await row.save();
    return { id: row.id, restaurantId: row.restaurantId, name: row.name };
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
async function listOrders(restaurantId) {
  if (useDb) {
    const query = restaurantId ? { restaurantId } : {};
    const rows = await Order.find(query);
    return rows.map(r => ({ id: r.id, restaurantId: r.restaurantId, tableNo: r.tableNo, mobile: r.mobile, emailId: r.emailId, items: r.items, status: r.status, totalAmount: r.totalAmount, date: r.date, orderNumber: r.orderNumber, discount: r.discount || 0, orderType: r.orderType || 'dinein' }));
  }
  if (!store.orders) store.orders = [];
  return store.orders.filter(o => !restaurantId || o.restaurantId === restaurantId);
}

async function createOrder(data) {
  const id = uuidv4();
  const dateStr = data.date || new Date().toISOString().split('T')[0];
  
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
    orderType: data.orderType || 'dinein'
  };
  if (useDb) {
    const item = new Order(orderData);
    await item.save();
    return orderData;
  }
  if (!store.orders) store.orders = [];
  store.orders.push(orderData);
  return orderData;
}

async function getOrder(id) {
  if (useDb) {
    const row = await Order.findOne({ id });
    if (!row) return null;
    return { id: row.id, restaurantId: row.restaurantId, tableNo: row.tableNo, mobile: row.mobile, emailId: row.emailId, items: row.items, status: row.status, totalAmount: row.totalAmount, date: row.date, orderNumber: row.orderNumber, discount: row.discount || 0, orderType: row.orderType || 'dinein' };
  }
  if (!store.orders) store.orders = [];
  return store.orders.find(o => o.id === id) || null;
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
    await row.save();
    return { id: row.id, restaurantId: row.restaurantId, tableNo: row.tableNo, mobile: row.mobile, emailId: row.emailId, items: row.items, status: row.status, totalAmount: row.totalAmount, date: row.date, orderNumber: row.orderNumber, discount: row.discount || 0, orderType: row.orderType || 'dinein' };
  }
  if (!store.orders) store.orders = [];
  const idx = store.orders.findIndex(o => o.id === id);
  if (idx === -1) return null;
  store.orders[idx] = { ...store.orders[idx], ...data };
  return store.orders[idx];
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

    const superAdminRole = new Role({
      id: 'super-admin-role-id',
      name: 'Super Admin',
      sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'expenses', 'inventory', 'billing', 'users', 'system-status'],
      deleteAccess: true
    });
    const adminRole = new Role({
      id: 'admin-role-id',
      name: 'Admin',
      sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'expenses', 'inventory', 'billing'],
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
        sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'expenses', 'inventory', 'billing', 'users', 'system-status'],
        deleteAccess: true
      },
      {
        id: 'admin-role-id',
        name: 'Admin',
        sidebarAccess: ['dashboard', 'restaurants', 'menu', 'orders', 'expenses', 'inventory', 'billing'],
        deleteAccess: false
      }
    ];
    store.inventory = [];
    store.orders = [];
    store.customers = [];
    store.food = [];
    store.billing = [];
    console.log('✅ In-Memory database cleaned and default seeds applied.');
  }
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
  deleteCustomer
};
