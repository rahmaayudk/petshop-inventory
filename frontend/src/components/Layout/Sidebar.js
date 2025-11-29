import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        {
            path: '/',
            icon: '📊',
            label: 'Dashboard',
            exact: true
        },
        {
            path: '/inventory',
            icon: '📦',
            label: 'Inventory',
            exact: false
        },
        {
            path: '/transactions',
            icon: '🔄',
            label: 'Transaksi',
            exact: false
        },
        {
            path: '/reports',
            icon: '📋',
            label: 'Laporan',
            exact: false
        }
    ];

    return (
        <div className="sidebar col-md-3 col-lg-2 p-0">
            <div className="d-flex flex-column flex-shrink-0 p-3 text-white">
                <ul className="nav nav-pills flex-column mb-auto">
                    {menuItems.map((item) => (
                        <li key={item.path} className="nav-item">
                            <NavLink
                                to={item.path}
                                end={item.exact}
                                className={({ isActive }) => 
                                    `nav-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <span className="me-2">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;