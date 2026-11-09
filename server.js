require('dotenv').config();

const fs = require('fs');
const https = require('https');
const path = require('path');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const protectedRoutes = require('./src/routes/protectedRoutes');
const gigRoutes = require('./src/routes/gigRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const taxRoutes = require('./src/routes/taxRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  }
}));
app.use(cors());
app.use(mongoSanitize());
app.use(express.json({ limit: '10kb' }));
app.use(hpp());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many authentication requests, please try again later.' }
});

app.get('/', (req, res) => {
  res.json({
    name: 'HustleHub+ API',
    status: 'running',
    health: '/health',
    auth: '/api/auth',
    protected: '/api/protected'
  });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tax', taxRoutes);
app.use(errorHandler);

const startServer = async () => {
  const keyPath = path.join(__dirname, 'src/config/cert/key.pem');
  const certPath = path.join(__dirname, 'src/config/cert/cert.pem');

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    throw new Error('HTTPS certificates are missing. Run: npm run cert:generate');
  }

  await connectDB();
  const port = Number(process.env.PORT) || 8443;
  https.createServer({ key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }, app)
    .listen(port, () => logger.info('HTTPS server started', { port }));
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
