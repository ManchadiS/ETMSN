const request = require('supertest');
const app = require('../src/app');

describe('Users API', () => {
  let userId;
  const testUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    dob: '1995-05-15',
    age: 31
  };

  test('POST /api/v1/users/register should create a user', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(testUser.email);
    expect(res.body).not.toHaveProperty('password');
    userId = res.body.id;
  });

  test('POST /api/v1/users/register with duplicate email should fail', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send(testUser);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/v1/users/login with correct credentials should succeed', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(userId);
    expect(res.body.firstName).toBe(testUser.firstName);
  });

  test('POST /api/v1/users/login with incorrect credentials should fail', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/v1/users should list all users without password', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find(u => u.id === userId);
    expect(found).toBeDefined();
    expect(found).not.toHaveProperty('password');
  });

  test('GET /api/v1/users/:id should return details of the user', async () => {
    const res = await request(app).get(`/api/v1/users/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body).not.toHaveProperty('password');
  });

  test('PUT /api/v1/users/:id should update user details', async () => {
    const res = await request(app)
      .put(`/api/v1/users/${userId}`)
      .send({
        firstName: 'Johnny',
        age: 32
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.firstName).toBe('Johnny');
    expect(res.body.age).toBe(32);
  });

  test('DELETE /api/v1/users/:id should remove the user', async () => {
    const res = await request(app).delete(`/api/v1/users/${userId}`);
    expect(res.statusCode).toBe(204);

    const checkRes = await request(app).get(`/api/v1/users/${userId}`);
    expect(checkRes.statusCode).toBe(404);
  });
});
