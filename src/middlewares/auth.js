const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const db = require('../config/db');

const verifyToken = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');

        const userResult = await db.query(
            'SELECT id, username, role, status FROM users WHERE id = $1',
            [decoded.id]
        );

        if (userResult.rowCount === 0) {
            return res.status(401).json({ error: 'User no longer exists.' });
        }

        const liveUser = userResult.rows[0];
        req.user = liveUser;

        if (liveUser.status !== 'active') {
            return res.status(403).json({ error: 'User is inactive. Access forbidden.' });
        }
        
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden. You do not have permission to perform this action.' });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };