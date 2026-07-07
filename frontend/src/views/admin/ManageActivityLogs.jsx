import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { fetchAdminActivityLogs } from "../../services/adminActivityLog.service";
import "./ManageActivityLogs.css";

function formatDateTime(value) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getModuleClass(module) {
  switch (module) {
    case "Sản phẩm":
      return "product";
    case "Đơn hàng":
      return "order";
    case "Người dùng":
      return "user";
    case "Khuyến mãi":
      return "promotion";
    default:
      return "default";
  }
}

export default function ManageActivityLogs() {
  const { user } = useAuth();
  const token = user?.token || "";

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const loadLogs = async () => {
      if (!token) return;

      setLoading(true);
      setError("");

      try {
        const result = await fetchAdminActivityLogs(token, 200);
        setLogs(result || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Không tải được nhật ký hoạt động"
        );
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [token]);

  const modules = useMemo(() => {
    const uniqueModules = Array.from(
      new Set(logs.map((item) => item.module).filter(Boolean))
    );

    return uniqueModules;
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return logs.filter((item) => {
      const matchModule =
        moduleFilter === "ALL" || item.module === moduleFilter;

      const searchableText = [
        item.adminEmail,
        item.module,
        item.action,
        item.targetName,
        item.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchKeyword =
        !normalizedKeyword || searchableText.includes(normalizedKeyword);

      return matchModule && matchKeyword;
    });
  }, [logs, moduleFilter, keyword]);

  return (
    <div className="activity-log-page">
      <div className="admin-dashboard-layout">
        <Sidebar />

        <main className="activity-log-content">
          <header className="activity-log-header">
            <div>
              <p className="activity-log-label">Quản trị hệ thống</p>
              <h1>Nhật ký hoạt động</h1>
              <p>
                Theo dõi các thao tác quan trọng của quản trị viên trên hệ
                thống.
              </p>
            </div>
          </header>

          {error && <div className="auth-error">{error}</div>}
          {loading && <div className="auth-error">Đang tải nhật ký...</div>}

          <section className="activity-log-summary">
            <div className="activity-log-card">
              <span>Tổng nhật ký</span>
              <strong>{logs.length.toLocaleString("vi-VN")}</strong>
            </div>

            <div className="activity-log-card">
              <span>Kết quả đang xem</span>
              <strong>{filteredLogs.length.toLocaleString("vi-VN")}</strong>
            </div>

            <div className="activity-log-card">
              <span>Nhóm chức năng</span>
              <strong>{modules.length.toLocaleString("vi-VN")}</strong>
            </div>
          </section>

          <section className="activity-log-panel">
            <div className="activity-log-toolbar">
              <label>
                <span>Nhóm chức năng</span>
                <select
                  value={moduleFilter}
                  onChange={(event) => setModuleFilter(event.target.value)}
                >
                  <option value="ALL">Tất cả</option>
                  {modules.map((module) => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Tìm kiếm</span>
                <input
                  type="text"
                  placeholder="Tìm theo email, thao tác, mô tả..."
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </label>
            </div>

            <div className="activity-log-table">
              <div className="activity-log-table-head">
                <span>Thời gian</span>
                <span>Admin</span>
                <span>Nhóm</span>
                <span>Thao tác</span>
                <span>Đối tượng</span>
                <span>Mô tả</span>
              </div>

              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div className="activity-log-row" key={log.id}>
                    <span>{formatDateTime(log.createdDate)}</span>
                    <span>{log.adminEmail}</span>
                    <span>
                      <span
                        className={`activity-module-badge ${getModuleClass(
                          log.module
                        )}`}
                      >
                        {log.module || "Khác"}
                      </span>
                    </span>
                    <span className="activity-action">{log.action}</span>
                    <span>{log.targetName || `#${log.targetId || "-"}`}</span>
                    <span>{log.description || "Không có mô tả"}</span>
                  </div>
                ))
              ) : (
                <div className="activity-log-empty">
                  Chưa có nhật ký hoạt động phù hợp.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}