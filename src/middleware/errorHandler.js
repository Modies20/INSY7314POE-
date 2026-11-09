const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Request failed', {
    error: err.message || 'Internal Server Error',
    stack: err.stack,
    method: req.method,
    path: req.path
  });

  const status = Number.isInteger(err.status) ? err.status : 500;
  const response = {
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : (err.message || 'Internal Server Error')
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  return res.status(status).json(response);
};

module.exports = errorHandler;
