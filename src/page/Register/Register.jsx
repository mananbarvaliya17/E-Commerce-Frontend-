import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Register.css'
import { API_BASE_URL } from '../../config';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    userimage: null,
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    adminSecret: ""
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const validate = () => {
    if (!formData.username.trim()) return 'Username is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Enter a valid email address';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!/^[0-9]{10}$/.test(formData.phone.trim())) return 'Enter a valid 10-digit phone number';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.role === 'admin' && !formData.adminSecret.trim()) return 'Admin registration secret is required';
    return null;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "userimage") {
      setFormData({ ...formData, userimage: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = new FormData();
      payload.append('username', formData.username);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('password', formData.password);
      payload.append('role', formData.role);

      if (formData.role === 'admin') {
        payload.append('adminSecret', formData.adminSecret);
      }

      if (formData.userimage) {
        payload.append('userimage', formData.userimage);
      }

      const data = await apiFetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        body: payload,
        credentials: 'include'
      });

      const createdUser = data.user;
      if (createdUser) {
        loginUser(createdUser);
      }
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate(createdUser?.role === 'admin' ? '/preview' : '/home'), 1000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h1>Create Your Account</h1>
          <p>Start shopping with exclusive offers and faster checkout.</p>
        </div>

        <div className="form-grid">
          <div className="input-group full">
            <label htmlFor="userimage">Profile Photo (optional)</label>
            <input
              id="userimage"
              type="file"
              name="userimage"
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="input-group full">
            <label htmlFor="role">Account Type</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role === 'admin' && (
            <div className="input-group full">
              <label htmlFor="adminSecret">Admin Registration Secret</label>
              <input
                id="adminSecret"
                type="password"
                name="adminSecret"
                placeholder="Enter admin registration secret"
                value={formData.adminSecret}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        {error ? <p className="register-feedback register-feedback--error">{error}</p> : null}
        {success ? <p className="register-feedback register-feedback--success">{success}</p> : null}

        <button type="submit" className="register-submit" disabled={loading}>
          {loading ? <span className="register-spinner" /> : null}
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="register-login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <div className="trust-badges">
          <div className="trust-badge">Secure Checkout</div>
          <div className="trust-badge">Fast Support</div>
          <div className="trust-badge">Easy Returns</div>
        </div>
      </form>
    </div>
  );
}

export default Register;
