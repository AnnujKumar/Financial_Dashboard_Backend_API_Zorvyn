import { Link } from 'react-router-dom';

function Navbar({ auth, onLogout }) {
  const { user } = auth;

  if (!user) {
    return (
      <nav className="navbar">
        <div className="nav-brand">Finance Assignment Demo</div>
        <div className="nav-links">
          <Link to="/login">Login</Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">Finance Dashboard ({user.role})</div>
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        {['analyst', 'admin'].includes(user.role) && <Link to="/records">Records</Link>}
        {user.role === 'admin' && <Link to="/users">Users</Link>}
        <button onClick={onLogout} className="btn-logout">Logout ({user.username})</button>
      </div>
    </nav>
  );
}

export default Navbar;