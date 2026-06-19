const request = require('supertest');
const app = require('../src/app');

describe('Food API', () => {
  let created;

  test('POST /food should create a food item', async () => {
    const res = await request(app).post('/food').send({ name: 'Burger', price: 8.99, description: 'Beef burger', category: 'main' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Burger');
    created = res.body;
  });

  test('GET /food should list food items', async () => {
    const res = await request(app).get('/food');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /food/:id should return the food item', async () => {
    const res = await request(app).get(`/food/${created.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Burger');
  });

  test('PUT /food/:id should update the food item', async () => {
    const res = await request(app).put(`/food/${created.id}`).send({ price: 9.5 });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBeCloseTo(9.5);
  });

  test('DELETE /food/:id should delete the food item', async () => {
    const res = await request(app).delete(`/food/${created.id}`);
    expect(res.statusCode).toBe(204);
  });
});
