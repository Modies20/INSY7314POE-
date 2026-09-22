const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../server');
const User = require('../src/models/userModel');

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = 'jest-test-secret';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
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
