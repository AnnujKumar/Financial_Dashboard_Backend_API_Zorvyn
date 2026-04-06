const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

exports.register = async (req, res, next) => {
    try {
        const { username, password, role } = req.body;
        const assignRole = role || 'viewer';
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, status',
            [username, hashedPassword, assignRole]
        );

        res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') { // Postgres unique constraint violation
            return res.status(400).json({ error: 'Username already exists' });
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const userResult = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        
        if (userResult.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
        
        const user = userResult.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

        if (user.status !== 'active') return res.status(403).json({ error: 'Account is inactive' });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, status: user.status }, 
            process.env.JWT_SECRET || 'secret_key', 
            { expiresIn: '12h' }
        );

        res.json({ message: 'Logged in successfully', token });
    } catch (err) {
        next(err);
    }
};

// Admin only: manage user status
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (Number(id) === req.user.id && status === 'inactive') {
            return res.status(400).json({ error: 'You cannot deactivate your own account.' });
        }

        const result = await db.query('UPDATE users SET status = $1 WHERE id = $2 RETURNING id, username, status', [status, id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'User status updated', user: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

exports.listUsers = async (req, res, next) => {
    try {
        const result = await db.query(
            'SELECT id, username, role, status, created_at FROM users ORDER BY id ASC'
        );
        res.json({ data: result.rows });
    } catch (err) {
        next(err);
    }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const { id } = req.params;

        if (Number(id) === req.user.id && role !== 'admin') {
            return res.status(400).json({ error: 'You cannot remove your own admin role.' });
        }

        const result = await db.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role, status',
            [role, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User role updated', user: result.rows[0] });
    } catch (err) {
        next(err);
    }
};