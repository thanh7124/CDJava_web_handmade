import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { label: 'Tổng quan', to: '/dashboard' },
  { label: 'Sản phẩm', to: '/manage-products' },
  { label: 'Đơn hàng', to: '/manage-orders' },
  { label: 'Người dùng', to: '/manage-users' },
  { label: 'Danh mục', to: '/manage-categories' },
  { label: '🎟️ Khuyến mại', to: '/manage-promotions' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-brand">
          <div className="brand-icon">HM</div>
          <div className="brand-name">HANDMADE</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
            >
              <span className="link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-logout">
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
}
