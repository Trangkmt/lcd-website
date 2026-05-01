import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../../services/api';
import { ADMIN_AUTH_KEY, ADMIN_TOKEN_KEY } from '../../../utils/adminPermissions';
import './AdminLogin.css';

function isLoggedIn() {
    try {
        const raw = localStorage.getItem(ADMIN_AUTH_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return !!parsed?.id;
    } catch {
        return false;
    }
}

export default function AdminLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const [identity, setIdentity] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isLoggedIn()) {
            navigate('/admin', { replace: true });
        }
    }, [navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setErrorMessage('');

        if (!identity.trim() || !password) {
            setErrorMessage('Vui lòng nhập username/email và mật khẩu.');
            return;
        }

        setLoading(true);
        try {
            const payload = identity.includes('@')
                ? { email: identity.trim(), password }
                : { username: identity.trim(), password };

            const response = await authAPI.login(payload);
            localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(response.user));
            if (response.token) {
                localStorage.setItem(ADMIN_TOKEN_KEY, response.token);
            }

            const redirectPath = location.state?.from?.pathname || '/admin';
            navigate(redirectPath, { replace: true });
        } catch (err) {
            setErrorMessage(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <h1 className="admin-login-title">Đăng nhập Admin</h1>
                <p className="admin-login-subtitle">Vui lòng đăng nhập để truy cập trang quản trị</p>

                <form className="admin-login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username hoặc Email</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="admin hoặc admin@myapp.com"
                            value={identity}
                            onChange={(e) => setIdentity(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {errorMessage && <p className="error-text">{errorMessage}</p>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
}

