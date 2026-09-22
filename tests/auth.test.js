const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../src/models/userModel');

beforeAll(async () => {
  process.env.JWT_SECRET = 'jest-test-secret';
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hustlehub');
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
});

test('registers a freelancer and returns a JWT', async () => {
  const response = await request(app).post('/api/auth/register').send({
    email: 'jest-freelancer@example.com',
    password: 'Password123!',
    role: 'freelancer'
  });

  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty('token');
  expect(response.body.user).not.toHaveProperty('password');
});
