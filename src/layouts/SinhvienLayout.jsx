import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { MdPerson, MdWarning, MdLogout, MdShield } from "react-icons/md";

function getInitials(name) {
  if (!name) return "S";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function SinhvienLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--content-bg)" }}>
      {/* Top navbar for sinh vien */}
      <header
        style={{
          background: "var(--card-bg)",
          borderBottom: "1px solid var(--border)",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: "#1a1d2e",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 16,
              }}
            >
              <MdShield />
            </div>
            <span style={{ fontWeight: 800, fontSize: 14 }}>
           Early warning system 
            </span>
          </div>
          <nav style={{ display: "flex", gap: 4 }}>
            <NavLink
              to="/sinhvien/thong-tin"
              style={({ isActive }) => ({
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 500,
                textDecoration: "none",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                background: isActive ? "#eff6ff" : "none",
              })}
            >
              <MdPerson style={{ verticalAlign: "middle", marginRight: 5 }} />
              Thông tin cá nhân
            </NavLink>

            <NavLink
              to="/sinhvien/rui-ro"
              style={({ isActive }) => ({
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 500,
                textDecoration: "none",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                background: isActive ? "#eff6ff" : "none",
              })}
            >
              <MdWarning style={{ verticalAlign: "middle", marginRight: 5 }} />
              Thông tin rủi ro
            </NavLink>

            <NavLink
              to="/sinhvien/doi-mat-khau"
              style={({ isActive }) => ({
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 500,
                textDecoration: "none",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                background: isActive ? "#eff6ff" : "none",
              })}
            >
              <MdShield style={{ verticalAlign: "middle", marginRight: 5 }} />
              Đổi mật khẩu
            </NavLink>
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="avatar" style={{ background: "#059669" }}>
            {getInitials(user?.display_name || user?.username)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {user?.display_name || user?.username}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              SINH VIÊN
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            <MdLogout /> Đăng xuất
          </button>
        </div>
      </header>
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}
