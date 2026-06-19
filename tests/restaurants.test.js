const request = require('supertest');
const app = require('../src/app');

describe('Restaurants API', () => {
  let created;

  test('POST /restaurants should create a restaurant', async () => {
    const res = await request(app).post('/restaurants').send({ name: 'Test Restaurant', address: '123 Main St' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Restaurant');
    created = res.body;
  });

  test('GET /restaurants should list restaurants', async () => {
    const res = await request(app).get('/restaurants');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /restaurants/:id should return the restaurant', async () => {
    const res = await request(app).get(`/restaurants/${created.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test Restaurant');
  });

  test('PUT /restaurants/:id should update the restaurant', async () => {
    const res = await request(app).put(`/restaurants/${created.id}`).send({ name: 'Updated Restaurant' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Restaurant');
  });

  test('DELETE /restaurants/:id should delete the restaurant', async () => {
    const res = await request(app).delete(`/restaurants/${created.id}`);
    expect(res.statusCode).toBe(204);
  });
});
