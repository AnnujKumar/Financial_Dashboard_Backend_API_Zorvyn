import { useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Records from './components/Records';
import UsersAdmin from './components/UsersAdmin';

function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalized.length % 4;
    const padded = normalized + (pad ? '='.repeat(4 - pad) : '');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function ProtectedRoute({ allowedRoles, user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const auth = useMemo(() => ({ token, user }), [token, user]);

  const handleLogin = (newToken) => {
    const parsed = parseJwt(newToken);
    if (!parsed) return;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(parsed));
    setToken(newToken);
    setUser(parsed);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar auth={auth} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
            <Route
              path="/dashboard"
              element={(
                <ProtectedRoute allowedRoles={['viewer', 'analyst', 'admin']} user={user}>
                  <Dashboard auth={auth} />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/records"
              element={(
                <ProtectedRoute allowedRoles={['analyst', 'admin']} user={user}>
                  <Records auth={auth} />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/users"
              element={(
                <ProtectedRoute allowedRoles={['admin']} user={user}>
                  <UsersAdmin auth={auth} />
                </ProtectedRoute>
              )}
            />
            <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
