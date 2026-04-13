import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAllResults, getDashboardStats } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function TongQuan() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_sinhvien: 0,
    total_covan: 0,
    total_taikhoan: 0,
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, dRes] = await Promise.all([
          getDashboardStats(),
          getAllResults(user?.id, "khoa"),
        ]);
        setStats(sRes.data);
        const raw = dRes.data || [];
        const map = {};
        // Lấy kết quả dự báo mới nhất của từng sinh viên
        raw.forEach((r) => {
          if (
            !map[r.MSSV] ||
            new Date(r.created_at) > new Date(map[r.MSSV].created_at)
          )
            map[r.MSSV] = r;
        });
        setStudents(Object.values(map));
      } catch (err) {
        console.error("Lỗi tải dữ liệu tổng quan:", err);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const total = students.length;
  const atRisk = students.filter((s) => (s.risk_score || 0) >= 0.65).length;
  const avgRisk = total
    ? (
        (students.reduce((a, s) => a + (s.risk_score || 0), 0) / total) *
        100
      ).toFixed(2)
    : 0;

  const riskDist = [
    {
      name: "THẤP",
      value: students.filter((s) => (s.risk_score || 0) < 0.4).length,
      fill: "#10b981",
    },
    {
      name: "TRUNG BÌNH",
      value: students.filter(
        (s) => (s.risk_score || 0) >= 0.4 && (s.risk_score || 0) < 0.65,
      ).length,
      fill: "#f59e0b",
    },
    { name: "CAO", value: atRisk, fill: "#ef4444" },
  ];

  // SỬA LỖI SORT: Sắp xếp theo điểm rủi ro tăng dần từ a đến b
  const scoreData = [...students]
    .sort((a, b) => (a.risk_score || 0) - (b.risk_score || 0))
    .map((s, i) => ({
      x: i + 1,
      score: +((s.risk_score || 0) * 100).toFixed(2),
      name: s.HoTen,
    }));

  return (
    <div>
      <div className="page-header">
        <h1>Tổng quan hệ thống</h1>
        <p>Thống kê tổng hợp về sinh viên được quản lý</p>
      </div>

      <div
        className="metric-grid"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        <div className="metric-card">
          <div className="metric-label">Tổng SV dự báo</div>
          <div className="metric-value">{total}</div>
          <div className="metric-sub">Sinh viên</div>
        </div>
        <div className="metric-card warning">
          <div className="metric-label">Rủi ro trung bình</div>
          <div className="metric-value">{avgRisk}%</div>
        </div>
        <div className="metric-card danger">
          <div className="metric-label">SV Nguy cơ cao</div>
          <div className="metric-value">{atRisk}</div>
          <div className="metric-sub">Sinh viên</div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 20,
        }}
      >
        <div className="card card-body">
          <div className="chart-title" style={{ marginBottom: 16 }}>
            Phân bố Mức độ Rủi ro (Số lượng SV)
          </div>
          {loading ? (
            <div className="spinner" />
          ) : students.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={riskDist} barSize={50}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {riskDist.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
            >
              Chưa có dữ liệu dự báo
            </div>
          )}
        </div>

        <div className="card card-body">
          <div className="chart-title" style={{ marginBottom: 16 }}>
            Phân bổ điểm rủi ro (Theo sinh viên %)
          </div>
          {loading ? (
            <div className="spinner" />
          ) : students.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="x"
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Sinh viên",
                    position: "insideBottom",
                    offset: -5,
                    fontSize: 10,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  domain={[0, 100]}
                  label={{
                    value: "% Rủi ro",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 10,
                  }}
                />
                <Tooltip formatter={(value) => [`${value}%`, "Điểm rủi ro"]} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
            >
              Chưa có dữ liệu dự báo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
