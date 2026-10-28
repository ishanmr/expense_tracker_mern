import { NavLink, useNavigate } from 'react-router-dom';
import { Home, List, PlusCircle, Folder, Power } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ onOpenAddModal }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">ET</span>
            <span className="brand-name">ExpenseTracker</span>
          </div>
          <p className="sidebar-tagline">Manage Your Wealth Effortlessly</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Home size={19} className="nav-icon" />
            <span>[Dashboard]</span>
          </NavLink>

          <NavLink
            to="/expenses"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <List size={19} className="nav-icon" />
            <span>[Expenses]</span>
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Folder size={19} className="nav-icon" />
            <span>[Categories]</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-footer">
        <button type="button" className="logout-btn" onClick={handleLogout}>
          <Power size={18} />
          <span>[Logout]</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
