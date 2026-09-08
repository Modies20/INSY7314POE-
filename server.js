require('dotenv').config();

const fs = require('fs');
const https = require('https');
const path = require('path');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const authRoutes = require('./src/routes/authRoutes');
const protectedRoutes = require('./src/routes/protectedRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

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
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use(errorHandler);

const startServer = () => {
  const keyPath = path.join(__dirname, 'src/config/cert/key.pem');
  const certPath = path.join(__dirname, 'src/config/cert/cert.pem');

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    throw new Error('HTTPS certificates are missing. Run: npm run cert:generate');
  }

  const port = Number(process.env.PORT) || 8443;
  https.createServer({ key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }, app)
    .listen(port, () => console.log(`HTTPS server running on port ${port}`));
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
