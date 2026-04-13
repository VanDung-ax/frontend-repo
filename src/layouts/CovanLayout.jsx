import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  MdDashboard,
  MdSchool,
  MdBarChart,
  MdCloudUpload,
  MdLogout,
  MdSettings,
  MdNotifications,
  MdShield,
  MdWarning,
} from "react-icons/md";

const navItems = [
  { to: "/covan/tong-quan", icon: <MdDashboard />, label: "Tổng quan" },
  { to: "/covan/thong-ke", icon: <MdBarChart />, label: "Thống kê" },
  {
    to: "/covan/du-lieu-sinh-vien",
    icon: <MdSchool />,
    label: "Dữ liệu Sinh viên",
  },
  {
    to: "/covan/nguy-co-cao",
    icon: <MdWarning />,
    label: "Sinh viên Nguy cơ cao",
  },

  //{ to: '/covan/tai-du-lieu', icon: <MdCloudUpload />, label: 'Tải dữ liệu' },
];

function getInitials(name) {
  if (!name) return "C";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function CovanLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <MdShield />
          </div>
          <div className="logo-title">Cố vấn</div>
          <div className="logo-sub">Hệ thống dự báo</div>
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
          <button className="nav-item">
            <span className="nav-icon">
              <MdSettings />
            </span>{" "}
            Cài đặt
          </button>
          <button className="nav-item" onClick={handleLogout}>
            <span className="nav-icon">
              <MdLogout />
            </span>{" "}
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
          </div>
          <div className="topbar-right">
            <button className="icon-btn">
              <MdNotifications />
            </button>
            <div className="topbar-user">
              <div style={{ textAlign: "right" }}>
                <div className="user-name">
                  {user?.display_name || user?.username}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                  CỐ VẤN
                </div>
              </div>
              <div className="avatar" style={{ background: "#7c3aed" }}>
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
