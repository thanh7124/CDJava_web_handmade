import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import './Dashboard.css';

const dashboardStats = [
  { title: 'Đơn hàng', value: '1.248', subtitle: 'Tăng 12% so với tuần trước' },
  { title: 'Doanh thu', value: '₫ 364.200.000', subtitle: 'Tăng 8% so với tháng trước' },
  { title: 'Khách hàng', value: '832', subtitle: '37 khách hàng mới' },
  { title: 'Sản phẩm sắp hết', value: '18', subtitle: 'Cần nhập kho' },
];

const recentOrders = [
  { id: 'DH-1201', customer: 'Mai Anh', total: '₫ 1.280.000', status: 'Đang giao' },
  { id: 'DH-1200', customer: 'Huyền Trâm', total: '₫ 980.000', status: 'Đã hoàn thành' },
  { id: 'DH-1199', customer: 'Phúc Long', total: '₫ 2.450.000', status: 'Đang xử lý' },
  { id: 'DH-1198', customer: 'Lan Phương', total: '₫ 1.520.000', status: 'Đã huỷ' },
];

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="admin-dashboard-layout">
        <Sidebar />

        <main className="dashboard-content">
          <header className="dashboard-header">
            <div>
              <p className="dashboard-label">Bảng điều hành</p>
              <h1 className="dashboard-title">Trang quản trị</h1>
              <p className="dashboard-description">Tổng quan các chỉ số kinh doanh, đơn hàng và tình trạng cửa hàng.</p>
            </div>
            <div className="dashboard-actions">
              <button className="dashboard-action-btn">Tạo đơn mới</button>
              <button className="dashboard-action-btn secondary">Xem báo cáo</button>
            </div>
          </header>

          <section className="dashboard-grid">
            {dashboardStats.map((stat) => (
              <div className="dashboard-card" key={stat.title}>
                <span className="dashboard-card-title">{stat.title}</span>
                <h2 className="dashboard-card-value">{stat.value}</h2>
                <p className="dashboard-card-subtitle">{stat.subtitle}</p>
              </div>
            ))}
          </section>

          <section className="dashboard-overview">
            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <h2>Doanh số theo tuần</h2>
                  <p>Biểu đồ so sánh doanh thu và đơn hàng trong 7 ngày.</p>
                </div>
                <span className="panel-badge">Mới nhất</span>
              </div>
              <div className="sales-chart">
                <div className="chart-axis"><span>0</span><span>5k</span><span>10k</span><span>15k</span></div>
                <div className="chart-bars">
                  <div className="chart-bar" style={{height: '42%'}}><span>Th 2</span></div>
                  <div className="chart-bar" style={{height: '64%'}}><span>Th 3</span></div>
                  <div className="chart-bar" style={{height: '55%'}}><span>Th 4</span></div>
                  <div className="chart-bar" style={{height: '76%'}}><span>Th 5</span></div>
                  <div className="chart-bar" style={{height: '68%'}}><span>Th 6</span></div>
                  <div className="chart-bar" style={{height: '84%'}}><span>Th 7</span></div>
                  <div className="chart-bar" style={{height: '53%'}}><span>CN</span></div>
                </div>
              </div>
            </div>

            <aside className="dashboard-panel compact-panel">
              <div className="panel-header">
                <div>
                  <h2>Cửa hàng nhanh</h2>
                  <p>Xem sản phẩm nổi bật, đơn hàng cần xử lý và thông báo.</p>
                </div>
              </div>
              <div className="quick-summary">
                <div className="quick-item"><span className="quick-item-title">Sản phẩm mới</span><strong>24</strong></div>
                <div className="quick-item"><span className="quick-item-title">Đơn cần xử lý</span><strong>7</strong></div>
                <div className="quick-item"><span className="quick-item-title">Phản hồi</span><strong>15</strong></div>
              </div>
            </aside>
          </section>

          <section className="dashboard-panel recent-orders-panel">
            <div className="panel-header">
              <div>
                <h2>Đơn hàng gần đây</h2>
                <p>Danh sách đơn hàng mới nhất và trạng thái xử lý.</p>
              </div>
              <button className="dashboard-action-btn small">Xem tất cả</button>
            </div>

            <div className="recent-orders-table">
              <div className="table-head"><span>Mã đơn</span><span>Khách hàng</span><span>Tổng tiền</span><span>Trạng thái</span></div>
              {recentOrders.map((order) => (
                <div className="table-row" key={order.id}>
                  <span>{order.id}</span>
                  <span>{order.customer}</span>
                  <span>{order.total}</span>
                  <span className={`status-badge ${order.status === 'Đã hoàn thành' ? 'success' : order.status === 'Đã huỷ' ? 'danger' : 'pending'}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
