const { validationResult } = require('express-validator');
const User = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');
const logger = require('../utils/logger');

const MAX_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCK_DURATION_MS = 15 * 60 * 1000;

const publicUser = (user) => ({ id: user._id.toString(), email: user.email, role: user.role });

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
    if (await User.exists({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ email, password: await hashPassword(password), role });
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
    if (sendValidationErrors(req, res)) {
      logger.warn('Rejected login attempt with invalid input');
      return;
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.warn('Failed login attempt for unknown account', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      logger.warn('Login blocked for locked account', { userId: user._id.toString() });
      return res.status(403).json({ message: 'Account locked. Try again later.' });
    }

    if (user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    if (!(await comparePassword(password, user.password))) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + ACCOUNT_LOCK_DURATION_MS);
      }
      await user.save();
      logger.warn('Failed login attempt', {
        userId: user._id.toString(),
        loginAttempts: user.loginAttempts,
        locked: Boolean(user.lockUntil)
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    logger.info('User logged in successfully', { userId: user._id.toString(), email: user.email });

    return res.json({
      message: 'Login successful',
      token: generateToken(publicUser(user)),
      user: publicUser(user)
    });
  } catch (error) {
    return next(error);
  }
};
