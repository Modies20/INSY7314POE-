const test = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../server');
const User = require('../src/models/userModel');

let server;
let baseUrl;

test.before(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  User.clear();
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('registers, logs in, and accesses the protected dashboard', async () => {
  const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'client@example.com', password: 'SecurePass123!', role: 'client' })
  });
  assert.equal(registerResponse.status, 201);
  const registered = await registerResponse.json();
  assert.equal(registered.user.email, 'client@example.com');
  assert.equal(registered.user.password, undefined);

  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'client@example.com', password: 'SecurePass123!' })
  });
  assert.equal(loginResponse.status, 200);
  const loggedIn = await loginResponse.json();

  const dashboardResponse = await fetch(`${baseUrl}/api/protected/dashboard`, {
    headers: { authorization: `Bearer ${loggedIn.token}` }
  });
  assert.equal(dashboardResponse.status, 200);
  assert.equal((await dashboardResponse.json()).user.email, 'client@example.com');
});

test('rejects weak registration and missing authentication', async () => {
  const invalidResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'invalid@example.com', password: 'weak' })
  });
  assert.equal(invalidResponse.status, 400);

  const protectedResponse = await fetch(`${baseUrl}/api/protected/dashboard`);
  assert.equal(protectedResponse.status, 401);
});
