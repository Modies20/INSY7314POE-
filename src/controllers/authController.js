const { validationResult } = require('express-validator');
const User = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');

const publicUser = (user) => ({ id: user.id, email: user.email, role: user.role });

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return false;
  }

  res.status(400).json({ errors: errors.array() });
  return true;
};

exports.register = async (req, res, next) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const { email, password, role = 'client' } = req.body;
    if (User.findByEmail(email)) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = User.create({ email, password: await hashPassword(password), role });
    const token = generateToken(publicUser(user));

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: publicUser(user)
    });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const { email, password } = req.body;
    const user = User.findByEmail(email);
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
      message: 'Login successful',
      token: generateToken(publicUser(user)),
      user: publicUser(user)
    });
  } catch (error) {
    return next(error);
  }
};
