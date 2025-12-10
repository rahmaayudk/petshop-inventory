import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(username, password);
        
        if (result.success) {
            toast.success('Login berhasil!');
            navigate('/');
        } else {
            toast.error(result.message || 'Login gagal');
        }
        
        setLoading(false);
    };

    return (
        <div className="container-fluid vh-100 petshop-bg-primary">
            <div className="row h-100 justify-content-center align-items-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h2 className="card-title fw-bold petshop-text-primary">
                                    🐾 Petshop Inventory
                                </h2>
                                <p className="text-muted">Silakan login untuk melanjutkan</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-petshop w-100 py-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Memproses...
                                        </>
                                    ) : (
                                        '🚪 Login'
                                    )}
                                </button>
                            </form>

                            <div className="mt-4 text-center">
                                <small className="text-muted">
                                    Demo Account: admin / admin123
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;