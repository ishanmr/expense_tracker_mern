import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Wallet } from 'lucide-react';
import { registerUser, loginUser } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const isInitialRegister = location.pathname === '/register';
  const [isLoginTab, setIsLoginTab] = useState(!isInitialRegister);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTabSwitch = (isLogin) => {
    setIsLoginTab(isLogin);
    setError('');
    navigate(isLogin ? '/login' : '/register', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLoginTab) {
      if (!formData.name.trim()) {
        setError('Full Name is required.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    try {
      setLoading(true);
      if (isLoginTab) {
        const response = await loginUser({
          email: formData.email,
          password: formData.password,
        });
        login(response.data.user, response.token);
        navigate('/dashboard');
      } else {
        const response = await registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        login(response.data.user, response.token);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Hero Graphic Section (Matching Reference Image 2) */}
        <div className="auth-hero">
          <div className="auth-hero-graphic">
            <Wallet className="graphic-wallet" size={72} />
          </div>
          <div className="auth-hero-brand">
            <span className="brand-icon">ET</span>
            <h2>ExpenseTracker</h2>
          </div>
          <p className="auth-hero-tagline">Manage Your Wealth Effortlessly</p>
        </div>

        {/* Right Auth Card */}
        <div className="auth-card">
          <div className="auth-toggle">
            <button
              type="button"
              className={`auth-toggle-btn ${isLoginTab ? 'active' : ''}`}
              onClick={() => handleTabSwitch(true)}
            >
              [Login]
            </button>
            <button
              type="button"
              className={`auth-toggle-btn ${!isLoginTab ? 'active' : ''}`}
              onClick={() => handleTabSwitch(false)}
            >
              [Register]
            </button>
          </div>

          <h2 className="auth-heading">
            {isLoginTab ? 'Welcome Back!' : 'Create an Account'}
          </h2>
          <p className="auth-subtext">
            {isLoginTab
              ? 'Enter your credentials to access your financial dashboard'
              : 'Start tracking and organizing your daily personal expenses'}
          </p>

          {error && <div className="auth-alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLoginTab && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="form-input"
                    required={!isLoginTab}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLoginTab && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="form-input"
                    required={!isLoginTab}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : isLoginTab ? 'LOGIN' : 'REGISTER'}
            </button>
          </form>

          <p className="auth-switch">
            {isLoginTab ? "Don't have an account?" : 'Already have an account?'}
            <span
              className="auth-switch-link"
              onClick={() => handleTabSwitch(!isLoginTab)}
            >
              {isLoginTab ? 'Register Now' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
