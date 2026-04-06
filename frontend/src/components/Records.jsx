import { useState, useEffect } from 'react';
import api from '../api';

function Records({ auth }) {
  const { user } = auth;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0
  });
  
  // Create / Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [formData, setFormData] = useState({
    amount: '', type: 'expense', category: '', date: '', notes: ''
  });

  const canEdit = user.role === 'admin';

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async (overrideFilters) => {
    try {
      setLoading(true);
      const validOverride = overrideFilters && typeof overrideFilters === 'object' && !('nativeEvent' in overrideFilters);
      const sourceFilters = validOverride ? overrideFilters : filters;
      const cleanFilters = Object.fromEntries(
        Object.entries(sourceFilters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
      );
      const res = await api.get('/records', { params: cleanFilters });
      setRecords(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditRecord(record);
      setFormData({
        amount: record.amount,
        type: record.type,
        category: record.category,
        date: record.date.split('T')[0], // format date for input
        notes: record.notes || ''
      });
    } else {
      setEditRecord(null);
      setFormData({ amount: '', type: 'expense', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
    }
    setShowModal(true);
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editRecord) {
        await api.put(`/records/${editRecord.id}`, formData);
      } else {
        await api.post('/records', formData);
      }
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save record');
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/records/${id}`);
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete record');
    }
  };

  return (
    <div className="records-page">
      <header className="page-header">
        <div>
          <h1>Financial Records</h1>
          <p>Role: {user.role} {canEdit ? '(Create/Edit Enabled)' : '(Read Only)'}</p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add Record</button>
        )}
      </header>

      <div className="filters-panel">
        <div className="form-group">
          <label>Type</label>
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            placeholder="e.g. salary"
          />
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Limit</label>
          <input
            type="number"
            min="1"
            max="100"
            value={filters.limit}
            onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value) || 50 })}
          />
        </div>
        <div className="filter-actions">
          <button className="btn-primary" onClick={() => fetchRecords()}>Apply Filters</button>
          <button
            className="btn-secondary"
            onClick={() => {
              const resetFilters = { type: '', category: '', startDate: '', endDate: '', limit: 50, offset: 0 };
              setFilters(resetFilters);
              fetchRecords(resetFilters);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {loading ? <p>Loading records...</p> : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Notes</th>
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.category}</td>
                <td className={`type-${record.type}`}>{record.type}</td>
                <td>${parseFloat(record.amount).toFixed(2)}</td>
                <td>{record.notes || '-'}</td>
                {canEdit && (
                  <td>
                    <button className="btn-edit" onClick={() => handleOpenModal(record)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDeleteRecord(record.id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={canEdit ? "6" : "5"} className="text-center">No records found.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{editRecord ? 'Edit Record' : 'Add Record'}</h2>
            <form onSubmit={handleSaveRecord}>
              <div className="form-group">
                <label>Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Records;