import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { API_BASE_URL } from '../../config';
import { apiFetch } from '../../utils/api';

const Login = () => {
    const [userType, setUserType] = useState('email');
    const [formData, setFormData] = useState({ email: '', username: '', password: '', otp: '' });
    const [otpRequired, setOtpRequired] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                password: formData.password,
                otp: formData.otp || undefined,
                ...(userType === 'email' ? { email: formData.email } : { username: formData.username })
            };

            const data = await apiFetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (data.requiresOtp) {
                setOtpRequired(true);
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Redirect based on user role
            const redirectTo = data.user?.role === 'admin' ? '/preview' : '/home';
            navigate(redirectTo);
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleLogin}>
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Login to your account to continue shopping.</p>
                </div>

                <div className="login-toggle">
                    <button
                        type="button"
                        className={userType === 'email' ? 'active' : ''}
                        onClick={() => setUserType('email')}
                    >
                        Login with Email
                    </button>

                    <button
                        type="button"
                        className={userType === 'username' ? 'active' : ''}
                        onClick={() => setUserType('username')}
                    >
                        Login with Username
                    </button>
                </div>

                <div className="form-grid">
                    {userType === 'email' ? (
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

                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {otpRequired && (
                                <>
                                    <label htmlFor="otp">OTP</label>
                                    <input
                                        id="otp"
                                        type="number"
                                        name="otp"
                                        placeholder="Enter your OTP"
                                        value={formData.otp}
                                        onChange={handleChange}
                                    />
                                </>
                            )}
                        </div>
                    ) : (
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

                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {otpRequired && (
                                <>
                                    <label htmlFor="otp">OTP</label>
                                    <input
                                        id="otp"
                                        type="number"
                                        name="otp"
                                        placeholder="Enter your OTP"
                                        value={formData.otp}
                                        onChange={handleChange}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>

                {error ? <p style={{ color: '#c53030' }}>{error}</p> : null}

                <button className="login-cta" type="submit" disabled={loading}>
                    {loading ? 'Please wait...' : otpRequired ? 'Verify OTP' : 'Login'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '4px', color: '#475569' }}>
                    New user? <Link to="/register">Create account</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
