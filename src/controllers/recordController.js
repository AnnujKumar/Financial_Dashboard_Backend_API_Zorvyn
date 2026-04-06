const db = require('../config/db');

exports.createRecord = async (req, res, next) => {
    try {
        const value = req.body;

        const result = await db.query(
            'INSERT INTO records (amount, type, category, date, notes, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [value.amount, value.type, value.category, value.date, value.notes, req.user.id]
        );
        res.status(201).json({ message: 'Record created', data: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

exports.getRecords = async (req, res, next) => {
    try {
        const { type, category, startDate, endDate, limit, offset } = req.query;
        let query = 'SELECT * FROM records WHERE 1=1';
        const params = [];

        if (type) {
            params.push(type);
            query += ` AND type = $${params.length}`;
        }
        if (category) {
            params.push(category);
            query += ` AND category = $${params.length}`;
        }
        if (startDate) {
            params.push(startDate);
            query += ` AND date >= $${params.length}`;
        }
        if (endDate) {
            params.push(endDate);
            query += ` AND date <= $${params.length}`;
        }

        params.push(limit);
        query += ` ORDER BY date DESC LIMIT $${params.length}`;
        params.push(offset);
        query += ` OFFSET $${params.length}`;

        const result = await db.query(query, params);
        res.json({ data: result.rows, limit, offset });
    } catch (err) {
        next(err);
    }
};

exports.updateRecord = async (req, res, next) => {
    try {
        const { id } = req.params;
        const value = req.body;

        const result = await db.query(
            'UPDATE records SET amount=$1, type=$2, category=$3, date=$4, notes=$5 WHERE id=$6 RETURNING *',
            [value.amount, value.type, value.category, value.date, value.notes, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Record updated', data: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

exports.deleteRecord = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM records WHERE id=$1 RETURNING id', [id]);
        
        if (result.rowCount === 0) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Record deleted', id });
    } catch (err) {
        next(err);
    }
};