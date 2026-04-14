import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  MdDashboard,
  MdPeople,
  MdSchool,
  MdManageAccounts,
  MdCloudUpload,
  MdModelTraining,
  MdLogout,
  MdNotifications,
  MdSearch,
  MdShield,
} from "react-icons/md";

const navItems = [
  { to: "/admin/dashboard", icon: <MdDashboard />, label: "Tổng Quan Hệ Thống" },
  { to: "/admin/quan-ly-co-van", icon: <MdPeople />, label: "Quản Lý Cố Vấn" },
  {
    to: "/admin/quan-ly-sinh-vien",
    icon: <MdSchool />,
    label: "Quản Lý Sinh Viên",
  },
  {
    to: "/admin/quan-ly-tai-khoan",
    icon: <MdManageAccounts />,
    label: "Quản Lý Tài Khoản",
  },
  { to: "/admin/upload-ai", icon: <MdCloudUpload />, label: "Upload & AI" },
  {
    to: "/admin/huan-luyen",
    icon: <MdModelTraining />,
    label: "Huấn Luyện Mô Hình",
  },
];

function getInitials(name) {
  if (!name) return "A";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRandomColor(name) {
  const colors = ["#2563eb", "#7c3aed", "#db2777", "#059669", "#d97706"];
  let sum = 0;
  for (const c of name || "") sum += c.charCodeAt(0);
  return colors[sum % colors.length];
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <MdShield />
          </div>
          <div className="logo-title">ADMIN </div>
          <div className="logo-sub">Early warning system</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item${isActive ? " active" : ""}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleLogout}>
            <span className="nav-icon">
              <MdLogout />
            </span>{" "}
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left"></div>
          <div className="topbar-right">
            <button className="icon-btn">
              <MdNotifications />
            </button>
            <div className="topbar-user">
              <div style={{ textAlign: "right" }}>
                <div className="user-name">
                  {user?.display_name || user?.username}
                </div>
                <div
                  className="user-role"
                  style={{ fontSize: 11, color: "var(--text-secondary)" }}
                >
                  ADMINISTRATOR
                </div>
              </div>
              <div
                className="avatar"
                style={{ background: getRandomColor(user?.username) }}
              >
                {getInitials(user?.display_name || user?.username)}
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
