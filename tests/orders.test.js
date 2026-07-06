const request = require('supertest');
const app = require('../src/app');

describe('Orders API', () => {
  let created;
  let restaurantId;

  beforeAll(async () => {
    const res = await request(app).post('/api/v1/restaurants').send({ name: 'Orders Test Restaurant', address: '456 Order Ave' });
    restaurantId = res.body.id;
  });

  afterAll(async () => {
    if (restaurantId) {
      await request(app).delete(`/api/v1/restaurants/${restaurantId}`);
    }
  });

  test('POST /api/v1/orders should create an order', async () => {
    const res = await request(app).post('/api/v1/orders').send({
      restaurantId,
      tableNo: 'Table 15',
      items: [
        { name: 'Paneer Butter Masala', price: 260.0, quantity: 2 }
      ],
      status: 'received',
      totalAmount: 520.0,
      date: '2026-07-05'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.tableNo).toBe('Table 15');
    expect(res.body.totalAmount).toBeCloseTo(520.0);
    created = res.body;
  });

  test('GET /api/v1/orders should list orders', async () => {
    const res = await request(app).get('/api/v1/orders');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/v1/orders/:id should return the order', async () => {
    const res = await request(app).get(`/api/v1/orders/${created.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.tableNo).toBe('Table 15');
  });

  test('PUT /api/v1/orders/:id should update the order', async () => {
    const res = await request(app).put(`/api/v1/orders/${created.id}`).send({ status: 'preparing', tableNo: 'Table 18' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('preparing');
    expect(res.body.tableNo).toBe('Table 18');
  });

  test('DELETE /api/v1/orders/:id should delete the order', async () => {
    const res = await request(app).delete(`/api/v1/orders/${created.id}`);
    expect(res.statusCode).toBe(204);
  });
});
