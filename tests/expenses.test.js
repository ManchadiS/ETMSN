const request = require('supertest');
const app = require('../src/app');

describe('Expenses API', () => {
  let created;
  let restaurantId;
  let token;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    token = loginRes.body.token;

    const res = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Expenses Test Restaurant', address: '123 Main St' });
    restaurantId = res.body.id;
  });

  afterAll(async () => {
    if (restaurantId) {
      await request(app)
        .delete(`/api/v1/restaurants/${restaurantId}`)
        .set('Authorization', `Bearer ${token}`);
    }
  });

  test('POST /api/v1/expenses should create an expense', async () => {
    const res = await request(app)
      .post('/api/v1/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 12.5, description: 'Lunch', date: '2026-06-19', category: 'food', restaurantId });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.amount).toBeCloseTo(12.5);
    created = res.body;
  });

  test('GET /api/v1/expenses should list expenses', async () => {
    const res = await request(app)
      .get('/api/v1/expenses')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/v1/expenses/:id should return the expense', async () => {
    const res = await request(app)
      .get(`/api/v1/expenses/${created.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.amount).toBeCloseTo(12.5);
  });

  test('PUT /api/v1/expenses/:id should update the expense', async () => {
    const res = await request(app)
      .put(`/api/v1/expenses/${created.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Team lunch' });
    expect(res.statusCode).toBe(200);
    expect(res.body.description).toBe('Team lunch');
  });

  test('DELETE /api/v1/expenses/:id should delete the expense', async () => {
    const res = await request(app)
      .delete(`/api/v1/expenses/${created.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });
});
