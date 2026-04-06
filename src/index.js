const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ 
  path: path.resolve(__dirname, '../.env'),
  override: false
});

const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { rejectSuspiciousInput } = require('./middlewares/requestHardening');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20kb', strict: true }));
app.use(rejectSuspiciousInput);

app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'financial-dashboard-backend',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'financial-dashboard-backend',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Routes setup
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Only start the server if not imported by tests
if (require.main === module) {
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle unhandled errors
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });

    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        process.exit(1);
    });
}

module.exports = app;