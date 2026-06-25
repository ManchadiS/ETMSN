const request = require('supertest');
const app = require('../src/app');

describe('Expenses API', () => {
  let created;
  let restaurantId;

  beforeAll(async () => {
    const res = await request(app).post('/restaurants').send({ name: 'Expenses Test Restaurant', address: '123 Main St' });
    restaurantId = res.body.id;
  });

  afterAll(async () => {
    if (restaurantId) {
      await request(app).delete(`/restaurants/${restaurantId}`);
    }
  });

  test('POST /expenses should create an expense', async () => {
    const res = await request(app).post('/expenses').send({ amount: 12.5, description: 'Lunch', date: '2026-06-19', category: 'food', restaurantId });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.amount).toBeCloseTo(12.5);
    created = res.body;
  });

  test('GET /expenses should list expenses', async () => {
    const res = await request(app).get('/expenses');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /expenses/:id should return the expense', async () => {
    const res = await request(app).get(`/expenses/${created.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.amount).toBeCloseTo(12.5);
  });

  test('PUT /expenses/:id should update the expense', async () => {
    const res = await request(app).put(`/expenses/${created.id}`).send({ description: 'Team lunch' });
    expect(res.statusCode).toBe(200);
    expect(res.body.description).toBe('Team lunch');
  });

  test('DELETE /expenses/:id should delete the expense', async () => {
    const res = await request(app).delete(`/expenses/${created.id}`);
    expect(res.statusCode).toBe(204);
  });
});
