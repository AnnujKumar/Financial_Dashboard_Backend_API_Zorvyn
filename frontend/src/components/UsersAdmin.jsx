import { useEffect, useState } from 'react';
import api from '../api';

function UsersAdmin({ auth }) {
  const currentUserId = Number(auth?.user?.id);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingId, setPendingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/auth/users');
      setUsers(data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateStatus = async (id, status) => {
    setError('');
    setSuccess('');
    setPendingId(id);
    try {
      const response = await api.patch(`/auth/users/${id}/status`, { status });
      const updatedUser = response.data?.user;
      if (updatedUser?.username && updatedUser?.status) {
        setSuccess(`${updatedUser.username} is now ${updatedUser.status}.`);
      } else {
        setSuccess(response.data?.message || 'Status updated.');
      }
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setPendingId(null);
    }
  };

  const updateRole = async (id, role) => {
    setError('');
    setSuccess('');
    setPendingId(id);
    try {
      const response = await api.patch(`/auth/users/${id}/role`, { role });
      setSuccess(response.data?.message || 'Role updated.');
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>User Administration</h1>
          <p>Test role and status management endpoints here.</p>
        </div>
      </header>

      {error && <div className="error-alert">{error}</div>}
      {success && <div className="success-alert">{success}</div>}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Role Actions</th>
              <th>Status Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>
                  <span className={`status-badge ${u.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  <div className="actions-row">
                    <button className="btn-edit" onClick={() => updateRole(u.id, 'viewer')} disabled={pendingId === u.id}>Viewer</button>
                    <button className="btn-edit" onClick={() => updateRole(u.id, 'analyst')} disabled={pendingId === u.id}>Analyst</button>
                    <button className="btn-edit" onClick={() => updateRole(u.id, 'admin')} disabled={pendingId === u.id}>Admin</button>
                  </div>
                </td>
                <td>
                  {Number(u.id) === currentUserId ? (
                    <span className="text-muted">Current user</span>
                  ) : (
                    <div className="actions-row">
                      <button className="btn-primary" onClick={() => updateStatus(u.id, 'active')} disabled={pendingId === u.id}>Activate</button>
                      <button className="btn-delete" onClick={() => updateStatus(u.id, 'inactive')} disabled={pendingId === u.id}>Deactivate</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UsersAdmin;
