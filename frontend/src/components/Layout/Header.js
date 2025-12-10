import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark petshop-bg-primary shadow-sm">
            <div className="container-fluid">
                <span className="navbar-brand mb-0 h1">
                    🐾 Seven March Pet Care Inventory
                </span>
                
                <div className="d-flex align-items-center">
                    {/* Dark Mode Toggle */}
                    <button 
                        className="btn btn-outline-light me-2"
                        onClick={toggleDarkMode}
                        title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                    
                    {/* User Menu */}
                    <div className="dropdown">
                        <button 
                            className="btn btn-outline-light dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                        >
                            👤 {user?.username}
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                                <button 
                                    className="dropdown-item"
                                    onClick={handleLogout}
                                >
                                    🚪 Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;