const db = require('../config/db');

exports.getSummary = async (req, res, next) => {
    try {
        // Calculate Totals
        const totalsResult = await db.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
            FROM records
        `);
        
        const totalIncome = parseFloat(totalsResult.rows[0].total_income);
        const totalExpenses = parseFloat(totalsResult.rows[0].total_expenses);
        const netBalance = totalIncome - totalExpenses;

        // Category-wise totals
        const categoryResult = await db.query(`
            SELECT category, type, SUM(amount) as total
            FROM records
            GROUP BY category, type
            ORDER BY total DESC
        `);

        // Recent activity
        const recentActivity = await db.query(`
            SELECT id, amount, type, category, date, notes 
            FROM records 
            ORDER BY date DESC, created_at DESC 
            LIMIT 5
        `);

        const monthlyTrends = await db.query(`
            SELECT 
                DATE_TRUNC('month', date)::date as month,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
            FROM records
            GROUP BY DATE_TRUNC('month', date)
            ORDER BY month DESC
            LIMIT 6
        `);

        res.json({
            totals: {
                income: totalIncome,
                expenses: totalExpenses,
                netBalance: netBalance
            },
            categories: categoryResult.rows,
            recentActivity: recentActivity.rows,
            monthlyTrends: monthlyTrends.rows
        });
    } catch (err) {
        next(err);
    }
};