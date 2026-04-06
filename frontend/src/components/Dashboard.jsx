import { useState, useEffect } from 'react';
import api from '../api';

function Dashboard({ auth }) {
  const { user } = auth;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="error-alert">{error}</div>;
  if (!data) return null;

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>Dashboard Summary</h1>
        <p>Welcome back, {user.username}! Your role is <strong>{user.role}</strong>.</p>
      </header>

      <div className="metrics-grid">
        <div className="metric-card bg-green">
          <h3>Total Income</h3>
          <p className="metric-value">${Number(data.totals.income).toFixed(2)}</p>
        </div>
        <div className="metric-card bg-red">
          <h3>Total Expenses</h3>
          <p className="metric-value">${Number(data.totals.expenses).toFixed(2)}</p>
        </div>
        <div className="metric-card bg-blue">
          <h3>Net Balance</h3>
          <p className="metric-value">${Number(data.totals.netBalance).toFixed(2)}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="chart-section">
          <h3>Category Breakdown</h3>
          {data.categories.length === 0 ? <p>No data to display.</p> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map((c, i) => (
                  <tr key={i}>
                    <td>{c.category}</td>
                    <td className={`type-${c.type}`}>{c.type}</td>
                    <td>${parseFloat(c.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="recent-activity-section">
          <h3>Recent Activity</h3>
          {data.recentActivity.length === 0 ? <p>No recent activity.</p> : (
            <ul className="activity-list">
              {data.recentActivity.map(act => (
                <li key={act.id} className="activity-item">
                  <span className="activity-date">{new Date(act.date).toLocaleDateString()}</span>
                  <span className="activity-cat">{act.category}</span>
                  <span className={`activity-amount ${act.type === 'income' ? 'text-green' : 'text-red'}`}>
                    {act.type === 'income' ? '+' : '-'}${parseFloat(act.amount).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section className="chart-section">
        <h3>Monthly Trends (Last 6 Months)</h3>
        {!data.monthlyTrends || data.monthlyTrends.length === 0 ? (
          <p>No monthly trend data.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Income</th>
                <th>Expenses</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlyTrends.map((row) => (
                <tr key={row.month}>
                  <td>{new Date(row.month).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</td>
                  <td>${Number(row.income).toFixed(2)}</td>
                  <td>${Number(row.expenses).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Dashboard;