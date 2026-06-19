// Simple store with optional SQLite persistence via knex
const { v4: uuidv4 } = require('uuid');
const useDb = process.env.USE_DB === 'true';
let knex;
if (useDb) {
  knex = require('../db/knex');
}

const store = {
  restaurants: [],
  rooms: [],
  bookings: [],
  expenses: []
};

async function listFoodItems() {
  if (useDb) {
    const rows = await knex('food_items').select('*');
    return rows.map(r => ({ id: r.uuid, name: r.name, price: r.price, description: r.description, category: r.category }));
  }
  return store.foodItems || [];
}

async function createFoodItem(data) {
  const payload = { uuid: uuidv4(), name: data.name, price: data.price, description: data.description || null, category: data.category || null };
  if (useDb) {
    const ids = await knex('food_items').insert(payload);
    const row = await knex('food_items').where({ id: ids[0] }).first();
    return { id: row.uuid, name: row.name, price: row.price, description: row.description, category: row.category };
  }
  if (!store.foodItems) store.foodItems = [];
  const item = { id: payload.uuid, name: payload.name, price: payload.price, description: payload.description, category: payload.category };
  store.foodItems.push(item);
  return item;
}

async function getFoodItem(id) {
  if (useDb) {
    const row = await knex('food_items').where({ uuid: id }).first();
    if (!row) return null;
    return { id: row.uuid, name: row.name, price: row.price, description: row.description, category: row.category };
  }
  if (!store.foodItems) store.foodItems = [];
  return store.foodItems.find(f => f.id === id) || null;
}

async function updateFoodItem(id, data) {
  if (useDb) {
    const row = await knex('food_items').where({ uuid: id }).first();
    if (!row) return null;
    await knex('food_items').where({ uuid: id }).update({ name: data.name || row.name, price: data.price || row.price, description: data.description || row.description, category: data.category || row.category });
    const updated = await knex('food_items').where({ uuid: id }).first();
    return { id: updated.uuid, name: updated.name, price: updated.price, description: updated.description, category: updated.category };
  }
  if (!store.foodItems) store.foodItems = [];
  const idx = store.foodItems.findIndex(f => f.id === id);
  if (idx === -1) return null;
  store.foodItems[idx] = { ...store.foodItems[idx], ...data };
  return store.foodItems[idx];
}

async function deleteFoodItem(id) {
  if (useDb) {
    const row = await knex('food_items').where({ uuid: id }).first();
    if (!row) return false;
    await knex('food_items').where({ uuid: id }).del();
    return true;
  }
  if (!store.foodItems) store.foodItems = [];
  const idx = store.foodItems.findIndex(f => f.id === id);
  if (idx === -1) return false;
  store.foodItems.splice(idx, 1);
  return true;
}

async function listBillings() {
  if (useDb) {
    const rows = await knex('billings').select('*');
    return rows.map(r => ({ id: r.uuid, amount: r.amount, restaurantId: r.restaurant_id, date: r.date, description: r.description, status: r.status, mobile: r.mobile, emailId: r.email_id, cgst: r.cgst, sgst: r.sgst, foodItems: r.food_items ? JSON.parse(r.food_items) : [] }));
  }
  return store.billings || [];
}

async function createBilling(data) {
  const payload = { uuid: uuidv4(), amount: data.amount, restaurant_id: data.restaurantId || null, date: data.date || null, description: data.description || null, status: data.status || 'pending', mobile: data.mobile || null, email_id: data.emailId || null, cgst: data.cgst || 0, sgst: data.sgst || 0, food_items: data.foodItems ? JSON.stringify(data.foodItems) : null };
  if (useDb) {
    const ids = await knex('billings').insert(payload);
    const row = await knex('billings').where({ id: ids[0] }).first();
    return { id: row.uuid, amount: row.amount, restaurantId: row.restaurant_id, date: row.date, description: row.description, status: row.status, mobile: row.mobile, emailId: row.email_id, cgst: row.cgst, sgst: row.sgst, foodItems: row.food_items ? JSON.parse(row.food_items) : [] };
  }
  if (!store.billings) store.billings = [];
  const billing = { id: payload.uuid, amount: payload.amount, restaurantId: payload.restaurant_id, date: payload.date, description: payload.description, status: payload.status, mobile: payload.mobile, emailId: payload.email_id, cgst: payload.cgst, sgst: payload.sgst, foodItems: data.foodItems || [] };
  store.billings.push(billing);
  return billing;
}

async function getBilling(id) {
  if (useDb) {
    const row = await knex('billings').where({ uuid: id }).first();
    if (!row) return null;
    return { id: row.uuid, amount: row.amount, restaurantId: row.restaurant_id, date: row.date, description: row.description, status: row.status, mobile: row.mobile, emailId: row.email_id, cgst: row.cgst, sgst: row.sgst, foodItems: row.food_items ? JSON.parse(row.food_items) : [] };
  }
  if (!store.billings) store.billings = [];
  return store.billings.find(b => b.id === id) || null;
}

async function updateBilling(id, data) {
  if (useDb) {
    const row = await knex('billings').where({ uuid: id }).first();
    if (!row) return null;
    const updateData = {
      amount: data.amount || row.amount,
      restaurant_id: data.restaurantId !== undefined ? data.restaurantId : row.restaurant_id,
      date: data.date || row.date,
      description: data.description || row.description,
      status: data.status || row.status,
      mobile: data.mobile !== undefined ? data.mobile : row.mobile,
      email_id: data.emailId !== undefined ? data.emailId : row.email_id,
      cgst: data.cgst !== undefined ? data.cgst : row.cgst,
      sgst: data.sgst !== undefined ? data.sgst : row.sgst,
      food_items: data.foodItems ? JSON.stringify(data.foodItems) : row.food_items
    };
    await knex('billings').where({ uuid: id }).update(updateData);
    const updated = await knex('billings').where({ uuid: id }).first();
    return { id: updated.uuid, amount: updated.amount, restaurantId: updated.restaurant_id, date: updated.date, description: updated.description, status: updated.status, mobile: updated.mobile, emailId: updated.email_id, cgst: updated.cgst, sgst: updated.sgst, foodItems: updated.food_items ? JSON.parse(updated.food_items) : [] };
  }
  if (!store.billings) store.billings = [];
  const idx = store.billings.findIndex(b => b.id === id);
  if (idx === -1) return null;
  store.billings[idx] = { ...store.billings[idx], ...data };
  return store.billings[idx];
}

async function deleteBilling(id) {
  if (useDb) {
    const row = await knex('billings').where({ uuid: id }).first();
    if (!row) return false;
    await knex('billings').where({ uuid: id }).del();
    return true;
  }
  if (!store.billings) store.billings = [];
  const idx = store.billings.findIndex(b => b.id === id);
  if (idx === -1) return false;
  store.billings.splice(idx, 1);
  return true;
}

async function listExpenses() {
  if (useDb) {
    const rows = await knex('expenses').select('*');
    return rows.map(r => ({ id: r.uuid, amount: r.amount, description: r.description, date: r.date, category: r.category }));
  }
  return store.expenses;
}

async function createExpense(data) {
  const payload = { uuid: uuidv4(), amount: data.amount, description: data.description || null, date: data.date || null, category: data.category || null };
  if (useDb) {
    const ids = await knex('expenses').insert(payload);
    const row = await knex('expenses').where({ id: ids[0] }).first();
    return { id: row.uuid, amount: row.amount, description: row.description, date: row.date, category: row.category };
  }
  const expense = { id: payload.uuid, amount: payload.amount, description: payload.description, date: payload.date, category: payload.category };
  store.expenses.push(expense);
  return expense;
}

async function getExpense(id) {
  if (useDb) {
    const row = await knex('expenses').where({ uuid: id }).first();
    if (!row) return null;
    return { id: row.uuid, amount: row.amount, description: row.description, date: row.date, category: row.category };
  }
  return store.expenses.find(e => e.id === id) || null;
}

async function updateExpense(id, data) {
  if (useDb) {
    const row = await knex('expenses').where({ uuid: id }).first();
    if (!row) return null;
    await knex('expenses').where({ uuid: id }).update({ amount: data.amount || row.amount, description: data.description || row.description, date: data.date || row.date, category: data.category || row.category });
    const updated = await knex('expenses').where({ uuid: id }).first();
    return { id: updated.uuid, amount: updated.amount, description: updated.description, date: updated.date, category: updated.category };
  }
  const idx = store.expenses.findIndex(e => e.id === id);
  if (idx === -1) return null;
  store.expenses[idx] = { ...store.expenses[idx], ...data };
  return store.expenses[idx];
}

async function deleteExpense(id) {
  if (useDb) {
    const row = await knex('expenses').where({ uuid: id }).first();
    if (!row) return false;
    await knex('expenses').where({ uuid: id }).del();
    return true;
  }
  const idx = store.expenses.findIndex(e => e.id === id);
  if (idx === -1) return false;
  store.expenses.splice(idx, 1);
  return true;
}

async function createRestaurant(data) {
  const payload = { uuid: uuidv4(), name: data.name, address: data.address || null };
  if (useDb) {
    const ids = await knex('restaurants').insert(payload);
    const row = await knex('restaurants').where({ id: ids[0] }).first();
    return { id: row.uuid, name: row.name, address: row.address };
  }
  const restaurant = { id: payload.uuid, ...data };
  store.restaurants.push(restaurant);
  return restaurant;
}

async function getRestaurant(id) {
  if (useDb) {
    const row = await knex('restaurants').where({ uuid: id }).first();
    if (!row) return null;
    return { id: row.uuid, name: row.name, address: row.address };
  }
  return store.restaurants.find(h => h.id === id);
}

async function updateRestaurant(id, data) {
  if (useDb) {
    const row = await knex('restaurants').where({ uuid: id }).first();
    if (!row) return null;
    await knex('restaurants').where({ uuid: id }).update({ name: data.name || row.name, address: data.address || row.address });
    const updated = await knex('restaurants').where({ uuid: id }).first();
    return { id: updated.uuid, name: updated.name, address: updated.address };
  }
  const idx = store.restaurants.findIndex(h => h.id === id);
  if (idx === -1) return null;
  store.restaurants[idx] = { ...store.restaurants[idx], ...data };
  return store.restaurants[idx];
}

async function deleteRestaurant(id) {
  if (useDb) {
    const row = await knex('restaurants').where({ uuid: id }).first();
    if (!row) return false;
    await knex('restaurants').where({ uuid: id }).del();
    return true;
  }
  const idx = store.restaurants.findIndex(h => h.id === id);
  if (idx === -1) return false;
  store.restaurants.splice(idx, 1);
  return true;
}

module.exports = {
  store,
  createRestaurant,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant
  ,listExpenses,
  createExpense,
  getExpense,
  updateExpense,
  deleteExpense
  ,listBillings,
  createBilling,
  getBilling,
  updateBilling,
  deleteBilling
  ,listFoodItems,
  createFoodItem,
  getFoodItem,
  updateFoodItem,
  deleteFoodItem
};
