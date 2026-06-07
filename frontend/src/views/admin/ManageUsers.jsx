import React, { useMemo, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import './AdminCrud.css';

const initialUsers = [
  { id: 1, fullName: 'Nguyễn Văn A', email: 'a@example.com', role: 'Quản trị', status: 'Hoạt động', joined: '2025-12-10' },
  { id: 2, fullName: 'Trần Thị B', email: 'b@example.com', role: 'Nhân viên', status: 'Hoạt động', joined: '2026-01-14' },
  { id: 3, fullName: 'Lê Văn C', email: 'c@example.com', role: 'Khách hàng', status: 'Khóa', joined: '2026-02-03' },
  { id: 4, fullName: 'Phạm Thị D', email: 'd@example.com', role: 'Khách hàng', status: 'Hoạt động', joined: '2026-03-22' },
];

const roleOptions = ['Tất cả', 'Quản trị', 'Nhân viên', 'Khách hàng'];

export default function ManageUsers() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('Tất cả');

  const filteredUsers = useMemo(() => {
    let result = [...initialUsers];
    if (query.trim()) {
      const lowerQuery = query.trim().toLowerCase();
      result = result.filter(
        (user) =>
          user.fullName.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery)
      );
    }
    if (role !== 'Tất cả') {
      result = result.filter((user) => user.role === role);
    }
    return result;
  }, [query, role]);

  return (
    <div className="admin-page manage-users-page">
      <div className="admin-dashboard-layout">
        <Sidebar />

        <main className="manage-products-content">
          <header className="page-header">
            <div>
              <p className="page-label">Quản lý người dùng</p>
              <h1 className="page-title">Người dùng</h1>
              <p className="page-description">
                Quản lý tài khoản, vai trò và trạng thái truy cập của khách hàng.
              </p>
            </div>
            <button className="page-action-btn">Thêm người dùng</button>
          </header>

          <section className="manage-products-filters">
            <div className="filter-field">
              <label>Tìm kiếm</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tên hoặc email"
              />
            </div>
            <div className="filter-field">
              <label>Vai trò</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="manage-products-table">
            <div className="table-head">
              <span>ID</span>
              <span>Họ và tên</span>
              <span>Email</span>
              <span>Vai trò</span>
              <span>Trạng thái</span>
              <span>Tham gia</span>
              <span>Hành động</span>
            </div>

            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div className="table-row" key={user.id}>
                  <span>{user.id}</span>
                  <span>{user.fullName}</span>
                  <span>{user.email}</span>
                  <span>{user.role}</span>
                  <span className={`status-pill ${user.status === 'Hoạt động' ? 'in-stock' : 'out-of-stock'}`}>
                    {user.status}
                  </span>
                  <span>{user.joined}</span>
                  <span className="row-actions">
                    <button className="action-btn edit">Sửa</button>
                    <button className="action-btn delete">Khóa</button>
                  </span>
                </div>
              ))
            ) : (
              <div className="empty-state">Không có người dùng phù hợp.</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
