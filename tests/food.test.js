const request = require('supertest');
const app = require('../src/app');

describe('Food API', () => {
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
      .send({ name: 'Food Test Restaurant', address: '123 Main St' });
    restaurantId = res.body.id;
  });

  afterAll(async () => {
    if (restaurantId) {
      await request(app)
        .delete(`/api/v1/restaurants/${restaurantId}`)
        .set('Authorization', `Bearer ${token}`);
    }
  });

  test('POST /api/v1/food should create a food item', async () => {
    const res = await request(app)
      .post('/api/v1/food')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Burger', price: 8.99, description: 'Beef burger', category: 'main', restaurantId });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Burger');
    created = res.body;
  });

  test('GET /api/v1/food should list food items', async () => {
    const res = await request(app).get('/api/v1/food');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/v1/food/:id should return the food item', async () => {
    const res = await request(app)
      .get(`/api/v1/food/${created.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Burger');
  });

  test('PUT /api/v1/food/:id should update the food item', async () => {
    const res = await request(app)
      .put(`/api/v1/food/${created.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 9.5 });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBeCloseTo(9.5);
  });

  test('DELETE /api/v1/food/:id should delete the food item', async () => {
    const res = await request(app)
      .delete(`/api/v1/food/${created.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });
});
