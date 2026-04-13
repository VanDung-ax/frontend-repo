import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAllResults } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || "N/A";
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

// Component biểu đồ đồng bộ với QuanLySinhVien
function BarChartCard({ title, data }) {
  const chartColors = [
    "#2563eb",
    "#38bdf8",
    "#22c55e",
    "#f59e0b",
    "#f97316",
    "#ef4444",
  ];

  const getBarColor = (name) => {
    if (!name) return "#2563eb";
    const text = String(name).toLowerCase();
    if (
      text.includes("thấp") ||
      text === "low" ||
      text === "near" ||
      text === "positive" ||
      text === "yes"
    )
      return "#22c55e";
    if (
      text.includes("trung bình") ||
      text === "medium" ||
      text === "moderate" ||
      text === "neutral"
    )
      return "#f59e0b";
    if (
      text.includes("cao") ||
      text === "high" ||
      text === "far" ||
      text === "negative" ||
      text === "no"
    )
      return "#ef4444";
    return "#2563eb";
  };

  const renderXAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x}, ${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="#64748b"
          fontSize={10}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="card card-body" style={{ minHeight: 260, padding: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={data}
          barSize={25}
          margin={{ top: 10, right: 8, left: 0, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f3f4f6"
            vertical={false}
          />
          <XAxis dataKey="name" tick={renderXAxisTick} interval={0} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
          <Tooltip cursor={{ fill: "rgba(37,99,235,0.08)" }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ThongKe() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAllResults(user?.id, "khoa");
        const raw = res.data || [];
        const map = {};
        raw.forEach((r) => {
          if (
            !map[r.MSSV] ||
            new Date(r.created_at) > new Date(map[r.MSSV].created_at)
          )
            map[r.MSSV] = r;
        });
        setStudents(Object.values(map));
      } catch {}
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) return <div className="spinner" />;

  const riskLevelLabels = [
    "THẤP (An toàn)",
    "TRUNG BÌNH (Cảnh báo)",
    "CAO (Nguy hiểm)",
  ];

  const riskLevelLabel = (score) => {
    if (score >= 0.65) return "CAO (Nguy hiểm)";
    if (score >= 0.4) return "TRUNG BÌNH (Cảnh báo)";
    return "THẤP (An toàn)";
  };

  // Hàm tính toán trung bình theo mức rủi ro (giống QuanLySinhVien)
  const avgByRiskLevel = (field) => {
    const aggregate = students.reduce((acc, item) => {
      const label = riskLevelLabel(Number(item.risk_score) || 0);
      const value = Number(item[field]);
      if (!Number.isNaN(value)) {
        if (!acc[label]) acc[label] = { total: 0, count: 0 };
        acc[label].total += value;
        acc[label].count += 1;
      }
      return acc;
    }, {});

    return riskLevelLabels.map((label) => ({
      name: label.split(" (")[0], // Rút gọn tên để hiển thị biểu đồ đẹp hơn
      value: aggregate[label]?.count
        ? Number((aggregate[label].total / aggregate[label].count).toFixed(1))
        : 0,
    }));
  };

  // Hàm đếm số lượng thuộc tính (giống QuanLySinhVien)
  const countBy = (field) => {
    const result = Object.entries(groupBy(students, field)).map(
      ([name, arr]) => ({ name, value: arr.length }),
    );
    const orderMap = {
      Low: 1,
      Medium: 2,
      High: 3,
      Negative: 1,
      Neutral: 2,
      Positive: 3,
      Far: 1,
      Moderate: 2,
      Near: 3,
      No: 1,
      Yes: 2,
    };

    return result.sort((a, b) => {
      const valA = orderMap[a.name];
      const valB = orderMap[b.name];
      if (valA !== undefined && valB !== undefined) return valA - valB;
      return a.name.localeCompare(b.name);
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Thống kê rủi ro</h1>
        <p>
          Phân tích chỉ số học tập theo mức độ rủi ro và các yếu tố tác động AI
        </p>
      </div>

      <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>
        📊 Chỉ số học tập trung bình theo Nhóm rủi ro(định lượng)
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <BarChartCard
          title="Chuyên cần Trung bình (%)"
          data={avgByRiskLevel("attendance")}
        />
        <BarChartCard
          title="Giờ học trung bình (Giờ)"
          data={avgByRiskLevel("hours_studied")}
        />
        <BarChartCard
          title="Giờ ngủ trung bình (Giờ)"
          data={avgByRiskLevel("sleep_hours")}
        />
        <BarChartCard
          title="Điểm số cũ trung bình"
          data={avgByRiskLevel("previous_scores")}
        />
      </div>

      <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>
        📋 Phân bổ các yếu tố tác động khác( định danh)
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <BarChartCard
          title="Khoảng cách đến trường"
          data={countBy("distance_from_home")}
        />
        <BarChartCard
          title="Tài nguyên học tập"
          data={countBy("access_to_resources")}
        />
        <BarChartCard
          title="Mức độ Động lực"
          data={countBy("motivation_level")}
        />
        <BarChartCard
          title="Thu nhập Gia đình"
          data={countBy("family_income")}
        />
        <BarChartCard
          title="Ảnh hưởng Bạn bè"
          data={countBy("peer_influence")}
        />
        <BarChartCard
          title="Tham gia Ngoại khóa"
          data={countBy("extracurricular_activities")}
        />
        <BarChartCard
          title="Chất lượng Giảng viên"
          data={countBy("teacher_quality")}
        />
      </div>
    </div>
  );
}
