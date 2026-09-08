const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return process.env.JWT_SECRET;
};

const generateToken = (payload) => jwt.sign(payload, getJwtSecret(), { expiresIn: '1h' });

const verifyToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
