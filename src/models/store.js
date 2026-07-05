// Simple store with optional MongoDB persistence via mongoose
const { v4: uuidv4 } = require('uuid');
const useDb = process.env.USE_DB === 'true';

let Restaurant, FoodItem, Expense, Billing, User, Inventory;

if (useDb) {
  const mongoose = require('mongoose');
  const { connect } = require('../db/mongodb');

  connect().catch(err => {
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
    foodItems: { type: Array, default: [] }
  }, { timestamps: true, id: false });

  const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: String, required: true },
    age: { type: Number, required: true }
  }, { timestamps: true, id: false });

  const InventorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true },
    name: { type: String, required: true }
  }, { timestamps: true, id: false });

  Restaurant = mongoose.model('Restaurant', RestaurantSchema);
  FoodItem = mongoose.model('FoodItem', FoodItemSchema);
  Expense = mongoose.model('Expense', ExpenseSchema);
  Billing = mongoose.model('Billing', BillingSchema);
  User = mongoose.model('User', UserSchema);
  Inventory = mongoose.model('Inventory', InventorySchema);
}

const store = {
  restaurants: [],
  rooms: [],
  bookings: [],
  expenses: [],
  users: [],
  inventory: []
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
    return rows.map(r => ({ id: r.id, amount: r.amount, restaurantId: r.restaurantId, date: r.date, description: r.description, status: r.status, mobile: r.mobile, emailId: r.emailId, cgst: r.cgst, sgst: r.sgst, foodItems: r.foodItems || [] }));
  }
  return (store.billings || []).filter(b => !restaurantId || b.restaurantId === restaurantId);
}

async function createBilling(data) {
  const id = uuidv4();
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
      foodItems: data.foodItems || []
    });
    await billing.save();
    return { id: billing.id, amount: billing.amount, restaurantId: billing.restaurantId, date: billing.date, description: billing.description, status: billing.status, mobile: billing.mobile, emailId: billing.emailId, cgst: billing.cgst, sgst: billing.sgst, foodItems: billing.foodItems };
  }
  if (!store.billings) store.billings = [];
  const billing = { id, amount: data.amount, restaurantId: data.restaurantId || null, date: data.date || null, description: data.description || null, status: data.status || 'pending', mobile: data.mobile || null, emailId: data.emailId || null, cgst: data.cgst || 0, sgst: data.sgst || 0, foodItems: data.foodItems || [] };
  store.billings.push(billing);
  return billing;
}

async function getBilling(id) {
  if (useDb) {
    const row = await Billing.findOne({ id });
    if (!row) return null;
    return { id: row.id, amount: row.amount, restaurantId: row.restaurantId, date: row.date, description: row.description, status: row.status, mobile: row.mobile, emailId: row.emailId, cgst: row.cgst, sgst: row.sgst, foodItems: row.foodItems || [] };
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
    await row.save();
    return { id: row.id, amount: row.amount, restaurantId: row.restaurantId, date: row.date, description: row.description, status: row.status, mobile: row.mobile, emailId: row.emailId, cgst: row.cgst, sgst: row.sgst, foodItems: row.foodItems || [] };
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

async function listUsers() {
  if (useDb) {
    const rows = await User.find({});
    return rows.map(r => ({ id: r.id, firstName: r.firstName, lastName: r.lastName, email: r.email, password: r.password, dob: r.dob, age: r.age }));
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
      age: data.age
    });
    await user.save();
    return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, dob: user.dob, age: user.age };
  }
  if (!store.users) store.users = [];
  const user = { id, firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password, dob: data.dob, age: data.age };
  store.users.push(user);
  return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, dob: user.dob, age: user.age };
}

async function getUser(id) {
  if (useDb) {
    const row = await User.findOne({ id });
    if (!row) return null;
    return { id: row.id, firstName: row.firstName, lastName: row.lastName, email: row.email, password: row.password, dob: row.dob, age: row.age };
  }
  if (!store.users) store.users = [];
  return store.users.find(u => u.id === id) || null;
}

async function getUserByEmail(email) {
  if (useDb) {
    const row = await User.findOne({ email });
    if (!row) return null;
    return { id: row.id, firstName: row.firstName, lastName: row.lastName, email: row.email, password: row.password, dob: row.dob, age: row.age };
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
    await row.save();
    return { id: row.id, firstName: row.firstName, lastName: row.lastName, email: row.email, dob: row.dob, age: row.age };
  }
  if (!store.users) store.users = [];
  const idx = store.users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  store.users[idx] = { ...store.users[idx], ...data };
  return { id: store.users[idx].id, firstName: store.users[idx].firstName, lastName: store.users[idx].lastName, email: store.users[idx].email, dob: store.users[idx].dob, age: store.users[idx].age };
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

module.exports = {
  store,
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
  listInventory,
  createInventory,
  getInventory,
  updateInventory,
  deleteInventory
};
