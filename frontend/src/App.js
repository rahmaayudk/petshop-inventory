import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/App.css';

// Pages
import Login from './pages/Auth/Login';
import EnhancedDashboard from './pages/Dashboard/EnhancedDashboard';
import ProductList from './pages/Inventory/ProductList';
import TransactionForm from './pages/Transactions/TransactionForm';
import Reports from './pages/Reports/Reports';
import UserManagement from './pages/Admin/UserManagement';

// Layout Components
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';

const ProtectedLayout = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Memuat...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-container">
            <Header />
            <div className="container-fluid">
                <div className="row">
                    <Sidebar />
                    <main className="col-md-9 col-lg-10 ms-sm-auto px-md-4 py-4">
                        <Routes>
                            <Route path="/" element={<EnhancedDashboard />} />
                            <Route path="/inventory" element={<ProductList />} />
                            <Route path="/transactions" element={<TransactionForm />} />
                                <Route path="/reports" element={<Reports />} />
                                {user && user.role === 'admin' && (
                                    <Route path="/users" element={<UserManagement />} />
                                )}
                        </Routes>
                    </main>
                </div>
            </div>
        </div>
    );
};

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/*" element={<ProtectedLayout />} />
                    </Routes>
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;