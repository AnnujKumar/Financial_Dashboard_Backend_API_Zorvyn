import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'viewer' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (isRegistering) {
        await api.post('/auth/register', formData);
        setIsRegistering(false);
        setMessage('Registration successful. You can now sign in.');
        setFormData({ ...formData, password: '' });
      } else {
        const { data } = await api.post('/auth/login', { username: formData.username, password: formData.password });
        onLogin(data.token);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        {error && <div className="error-alert">{error}</div>}
        {message && <div className="success-alert">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          {isRegistering && (
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="viewer">Viewer (Read Only Summary)</option>
                <option value="analyst">Analyst (Read Records)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>
          )}
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            {isRegistering ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <p className="toggle-auth">
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <button className="btn-link" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Login here' : 'Register here'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;