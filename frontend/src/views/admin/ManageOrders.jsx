
import React, { useMemo, useState } from 'react';
import { formatCurrency } from '../../services/product.service';
import Sidebar from '../../components/layout/Sidebar';
import './AdminCrud.css';

const initialOrders = [
  {
    id: 'DH-1210',
    customer: 'Nguyễn Thị Hà',
    total: 1280000,
    items: 3,
    date: '2026-06-01',
    status: 'Đang xử lý',
  },
  {
    id: 'DH-1209',
    customer: 'Trần Văn Minh',
    total: 640000,
    items: 1,
    date: '2026-05-31',
    status: 'Đã hoàn thành',
  },
  {
    id: 'DH-1208',
    customer: 'Lê Thị Hoa',
    total: 2100000,
    items: 5,
    date: '2026-05-30',
    status: 'Đang giao',
  },
  {
    id: 'DH-1207',
    customer: 'Phạm Minh Tuấn',
    total: 580000,
    items: 2,
    date: '2026-05-29',
    status: 'Đã huỷ',
  },
];

const statusOptions = ['Tất cả', 'Đang xử lý', 'Đang giao', 'Đã hoàn thành', 'Đã huỷ'];

export default function ManageOrders() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Tất cả');
  const [sort, setSort] = useState('date-desc');

  const filteredOrders = useMemo(() => {
    let result = [...initialOrders];
    if (query.trim()) {
      const keyword = query.trim().toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(keyword) ||
          order.customer.toLowerCase().includes(keyword)
      );
    }
    if (status !== 'Tất cả') {
      result = result.filter((order) => order.status === status);
    }

    result.sort((a, b) => {
      if (sort === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sort === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sort === 'total-desc') return b.total - a.total;
      if (sort === 'total-asc') return a.total - b.total;
      return 0;
    });

    return result;
  }, [query, status, sort]);

  return (
    <div className="admin-page manage-orders-page">
      <div className="admin-dashboard-layout">
        <Sidebar />

        <main className="manage-products-content">
          <header className="page-header">
            <div>
              <p className="page-label">Quản lý đơn hàng</p>
              <h1 className="page-title">Đơn hàng</h1>
              <p className="page-description">
                Theo dõi trạng thái đơn hàng, thông tin khách và tổng tiền.
              </p>
            </div>
            <button className="page-action-btn">Tạo đơn mới</button>
          </header>

          <section className="manage-products-filters">
            <div className="filter-field">
              <label>Tìm đơn hàng</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Mã đơn hoặc khách hàng"
              />
            </div>
            <div className="filter-field">
              <label>Trạng thái</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label>Sắp xếp</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="date-desc">Ngày mới nhất</option>
                <option value="date-asc">Ngày cũ nhất</option>
                <option value="total-desc">Tổng tiền cao nhất</option>
                <option value="total-asc">Tổng tiền thấp nhất</option>
              </select>
            </div>
          </section>

          <section className="manage-products-table">
            <div className="table-head">
              <span>Mã đơn</span>
              <span>Khách hàng</span>
              <span>Ngày</span>
              <span>Tổng tiền</span>
              <span>Số món</span>
              <span>Trạng thái</span>
              <span>Hành động</span>
            </div>

            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div className="table-row" key={order.id}>
                  <span>{order.id}</span>
                  <span>{order.customer}</span>
                  <span>{order.date}</span>
                  <span>{formatCurrency(order.total)}</span>
                  <span>{order.items}</span>
                  <span className={`status-pill ${order.status === 'Đã hoàn thành' ? 'in-stock' : order.status === 'Đang giao' ? 'low-stock' : order.status === 'Đang xử lý' ? 'status-processing' : 'out-of-stock'}`}>
                    {order.status}
                  </span>
                  <span className="row-actions">
                    <button className="action-btn edit">Xem</button>
                    <button className="action-btn delete">Cập nhật</button>
                  </span>
                </div>
              ))
            ) : (
              <div className="empty-state">Không có đơn hàng phù hợp.</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
