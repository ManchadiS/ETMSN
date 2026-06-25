const request = require('supertest');
const app = require('../src/app');

describe('Billing API', () => {
  let created;
  let restaurantId;

  beforeAll(async () => {
    const res = await request(app).post('/restaurants').send({ name: 'Billing Test Restaurant', address: '123 Main St' });
    restaurantId = res.body.id;
  });

  afterAll(async () => {
    if (restaurantId) {
      await request(app).delete(`/restaurants/${restaurantId}`);
    }
  });

  test('POST /billing should create a billing', async () => {
    const res = await request(app).post('/billing').send({ amount: 100.0, restaurantId, date: '2026-06-19', description: 'Invoice', status: 'pending' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.amount).toBeCloseTo(100.0);
    created = res.body;
  });

  test('POST /billing with email and food items should send bill', async () => {
    const res = await request(app).post('/billing').send({
      amount: 500.0,
      restaurantId,
      date: '2026-06-19',
      description: 'Lunch Bill',
      status: 'pending',
      mobile: '9870859624',
      emailId: 'customer@example.com',
      cgst: 18,
      sgst: 18,
      foodItems: [
        { name: 'Biryani', price: 250.0, quantity: 1, time: '13:00' },
        { name: 'Butter Naan', price: 50.0, quantity: 2, time: '13:05' },
        { name: 'Lassi', price: 60.0, quantity: 1, time: '13:00' }
      ]
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.mobile).toBe('9870859624');
    expect(res.body.emailId).toBe('customer@example.com');
    expect(res.body.cgst).toBe(18);
    expect(res.body.sgst).toBe(18);
    expect(res.body.foodItems).toHaveLength(3);
  });

  test('GET /billing should list billings', async () => {
    const res = await request(app).get('/billing');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /billing/:id should return the billing', async () => {
    const res = await request(app).get(`/billing/${created.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.amount).toBeCloseTo(100.0);
  });

  test('PUT /billing/:id should update the billing', async () => {
    const res = await request(app).put(`/billing/${created.id}`).send({ status: 'paid' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('paid');
  });

  test('DELETE /billing/:id should delete the billing', async () => {
    const res = await request(app).delete(`/billing/${created.id}`);
    expect(res.statusCode).toBe(204);
  });
});
