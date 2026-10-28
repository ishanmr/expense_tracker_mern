import { useAuth } from '../../context/AuthContext';

const Navbar = ({ title, subtitle }) => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="navbar">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      <div className="navbar-user">
        <div className="user-badge">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <span className="user-name">{user?.name || 'User'}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
