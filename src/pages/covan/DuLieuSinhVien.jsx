import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAllResults } from "../../services/api";
import { MdSearch } from "react-icons/md";

function getRiskLabel(score) {
  if (score >= 0.65) return "CAO (Nguy hiểm)";
  if (score >= 0.4) return "TRUNG BÌNH (Cảnh báo)";
  return "THẤP (An toàn)";
}

export default function DuLieuSinhVien() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Các state quản lý bộ lọc
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("all"); // Chỉ giữ lại bộ lọc Rủi ro

  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

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

  // Logic áp dụng cùng lúc 2 bộ lọc: Tìm kiếm + Rủi ro
  const filtered = students.filter((s) => {
    const matchSearch =
      !search ||
      s.MSSV?.toLowerCase().includes(search.toLowerCase()) ||
      s.HoTen?.toLowerCase().includes(search.toLowerCase());

    const score = s.risk_score || 0;
    const matchRisk =
      filterRisk === "all" ||
      (filterRisk === "high" && score >= 0.65) ||
      (filterRisk === "medium" && score >= 0.4 && score < 0.65) ||
      (filterRisk === "low" && score < 0.4);

    return matchSearch && matchRisk;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Đảm bảo không bị lỗi trang khi đổi bộ lọc làm số lượng dữ liệu giảm
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [filtered.length, page, totalPages]);

  return (
    <div>
      <div className="page-header">
        <h1>Danh sách Sinh viên</h1>
        <p>Dữ liệu sinh viên thuộc lớp quản lý</p>
      </div>

      <div
        className="card card-body"
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Thanh tìm kiếm */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--content-bg)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "7px 12px",
            flex: 1,
            minWidth: 250,
          }}
        >
          <MdSearch style={{ color: "var(--text-secondary)" }} />
          <input
            style={{
              border: "none",
              background: "none",
              outline: "none",
              fontSize: 13,
              width: "100%",
            }}
            placeholder="Nhập MSSV hoặc Tên..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Bộ lọc Rủi ro */}
        <select
          className="form-control form-select"
          style={{ width: 220 }}
          value={filterRisk}
          onChange={(e) => {
            setFilterRisk(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Mức độ rủi ro: Tất cả</option>
          <option value="high">Rủi ro cao (≥65%)</option>
          <option value="medium">Trung bình (40-65%)</option>
          <option value="low">An toàn (&lt;40%)</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="spinner" />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>MSSV</th>
                  <th>Họ và Tên</th>
                  <th>Lớp</th>
                  <th>Khoa</th>
                  <th>Ngành</th>
                  <th>Rủi ro (%)</th>
                  <th>Mức độ</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: 32,
                        color: "var(--text-secondary)",
                      }}
                    >
                      Không có dữ liệu phù hợp với bộ lọc
                    </td>
                  </tr>
                )}
                {paged.map((s) => {
                  const score = s.risk_score || 0;
                  return (
                    <tr key={s.MSSV}>
                      <td style={{ fontFamily: "monospace", fontWeight: 600 }}>
                        {s.MSSV}
                      </td>
                      <td style={{ fontWeight: 600 }}>{s.HoTen}</td>
                      <td
                        style={{ color: "var(--text-secondary)", fontSize: 13 }}
                      >
                        {s.Lop}
                      </td>
                      <td
                        style={{ color: "var(--text-secondary)", fontSize: 13 }}
                      >
                        {s.Khoa}
                      </td>
                      <td
                        style={{ color: "var(--text-secondary)", fontSize: 13 }}
                      >
                        {s.Nganh || "—"}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              score >= 0.65
                                ? "var(--danger)"
                                : score >= 0.4
                                  ? "var(--warning)"
                                  : "var(--success)",
                          }}
                        >
                          {(score * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${score >= 0.65 ? "badge-danger" : score >= 0.4 ? "badge-warning" : "badge-success"}`}
                          style={{ fontSize: 11 }}
                        >
                          {getRiskLabel(score)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Phân trang */}
        <div
          className="card-body"
          style={{
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            Hiển thị {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1} -{" "}
            {Math.min(page * PER_PAGE, filtered.length)} trên {filtered.length}{" "}
            sinh viên
          </span>
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            {Array.from(
              { length: Math.min(5, totalPages) },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                className={`page-btn${page === p ? " active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            {totalPages > 5 && (
              <span
                style={{ padding: "0 4px", color: "var(--text-secondary)" }}
              >
                ...
              </span>
            )}
            {totalPages > 5 && (
              <button
                className={`page-btn${page === totalPages ? " active" : ""}`}
                onClick={() => setPage(totalPages)}
              >
                {totalPages}
              </button>
            )}
            <button
              className="page-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
