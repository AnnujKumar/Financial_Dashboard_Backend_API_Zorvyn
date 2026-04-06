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

// Routes setup
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Only start the server if not imported by tests
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;