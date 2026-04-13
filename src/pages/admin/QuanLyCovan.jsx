import { useState, useEffect } from "react";
import {
  getAllCovan,
  addCovan,
  deleteCovan,
  getKhoaList,
  getAssignData,
  assignLop,
} from "../../services/api";
import { MdAdd, MdDelete, MdSearch } from "react-icons/md";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
const BG = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#db2777"];
function colorFor(name) {
  let s = 0;
  for (const c of name || "") s += c.charCodeAt(0);
  return BG[s % BG.length];
}

export default function QuanLyCovan() {
  const [tab, setTab] = useState(0);
  const [covans, setCovans] = useState([]);
  const [khoas, setKhoas] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedKhoa, setSelectedKhoa] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKhoa, setNewKhoa] = useState("");
  const [msg, setMsg] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Assign tab state
  const [aKhoa, setAKhoa] = useState("");
  const [aData, setAData] = useState({ covans: [], lops: [] });
  const [aCvId, setACvId] = useState("");
  const [aLops, setALops] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, kRes] = await Promise.all([getAllCovan(), getKhoaList()]);
      setCovans(cRes.data || []);
      setKhoas(kRes.data || []);
      if ((kRes.data || []).length) setNewKhoa(kRes.data[0].MaKhoa);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedKhoa]);

  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();
  const covanCountByKhoa = covans.reduce((acc, c) => {
    const key = normalize(c.MaKhoa) || normalize(c.TenKhoa) || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const filtered = covans.filter((c) => {
    const matchText =
      c.TenCoVan?.toLowerCase().includes(search.toLowerCase()) ||
      String(c.Id_CoVan).includes(search);
    const khoaKey = normalize(c.MaKhoa) || normalize(c.TenKhoa);
    const matchKhoa = !selectedKhoa || khoaKey === normalize(selectedKhoa);
    return matchText && matchKhoa;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageCovans = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await addCovan({ TenCoVan: newName.trim(), MaKhoa: newKhoa });
      setMsg({ type: "success", text: "Đã thêm cố vấn thành công!" });
      setNewName("");
      setShowAddForm(false);
      await loadData();
    } catch {
      setMsg({ type: "danger", text: "Lỗi khi thêm cố vấn." });
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm(`Xác nhận xóa cố vấn #${id}?`)) return;
    try {
      await deleteCovan(id);
      setMsg({ type: "success", text: `Đã xóa cố vấn ID ${id}!` });
      await loadData();
    } catch {
      setMsg({
        type: "danger",
        text: "Không tìm thấy hoặc có ràng buộc dữ liệu.",
      });
    }
  };

  const handleKhoaAssign = async (mK) => {
    setAKhoa(mK);
    try {
      const r = await getAssignData(mK);
      setAData(r.data);
      setACvId("");
      setALops([]);
    } catch {}
  };

  const handleSaveAssign = async () => {
    try {
      await assignLop({ id_covan: aCvId, malop_list: aLops });
      setMsg({ type: "success", text: "Phân công lưu thành công!" });
    } catch {
      setMsg({ type: "danger", text: "Lỗi khi lưu phân công." });
    }
  };

  return (
    <div>
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1>Quản lý Cố vấn</h1>
          <p>Thêm, xóa cố vấn và phân công lớp học</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm((prev) => !prev)}
        >
          <MdAdd style={{ marginRight: 8 }} />{" "}
          {showAddForm ? "Đóng biểu mẫu" : "Thêm cố vấn mới"}
        </button>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type}`}>
          {msg.text}{" "}
          <button
            onClick={() => setMsg(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="tabs">
        {["📋 Danh sách Cố vấn", "🏫 Phân công Lớp"].map((t, i) => (
          <button
            key={i}
            className={`tab-btn${tab === i ? " active" : ""}`}
            onClick={() => setTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div>
          <div className="card">
            <div
              className="card-body"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    Danh sách Cố vấn ({filtered.length})
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    Lọc theo khoa và tìm kiếm nhanh
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--content-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "6px 12px",
                    minWidth: 260,
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
                    placeholder="Tìm kiếm cố vấn..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                <button
                  type="button"
                  className={`btn btn-outline btn-xs${!selectedKhoa ? " active" : ""}`}
                  onClick={() => setSelectedKhoa("")}
                >
                  Tất cả ({covans.length})
                </button>
                {khoas.map((k) => (
                  <button
                    key={k.MaKhoa || k.TenKhoa}
                    type="button"
                    className={`btn btn-outline btn-xs${normalize(selectedKhoa) === normalize(k.MaKhoa || k.TenKhoa) ? " active" : ""}`}
                    onClick={() => setSelectedKhoa(k.MaKhoa || k.TenKhoa)}
                  >
                    {k.TenKhoa} (
                    {covanCountByKhoa[
                      normalize(k.MaKhoa) || normalize(k.TenKhoa)
                    ] || 0}
                    )
                  </button>
                ))}
              </div>
            </div>
            <div className="table-wrapper">
              {loading ? (
                <div className="spinner" />
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Họ và Tên</th>
                      <th>Khoa</th>
                      <th>Mã Khoa</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageCovans.map((c) => (
                      <tr key={c.Id_CoVan}>
                        <td
                          style={{ fontFamily: "monospace", fontWeight: 600 }}
                        >
                          #{c.Id_CoVan}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              className="avatar-initials"
                              style={{
                                background: colorFor(c.TenCoVan),
                                width: 32,
                                height: 32,
                                fontSize: 11,
                              }}
                            >
                              {getInitials(c.TenCoVan)}
                            </div>
                            <span style={{ fontWeight: 600 }}>
                              {c.TenCoVan}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: 13,
                          }}
                        >
                          {c.TenKhoa || "Chưa cập nhật"}
                        </td>
                        <td>
                          <span className="badge badge-info">
                            {c.MaKhoa || "-"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-xs"
                            onClick={() => handleDelete(c.Id_CoVan)}
                          >
                            <MdDelete />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pageCovans.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            textAlign: "center",
                            padding: 32,
                            color: "var(--text-secondary)",
                          }}
                        >
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
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
                Hiển thị{" "}
                {filtered.length === 0
                  ? 0
                  : Math.min(
                      filtered.length,
                      (currentPage - 1) * itemsPerPage + 1,
                    )}{" "}
                - {Math.min(currentPage * itemsPerPage, filtered.length)} trên{" "}
                {filtered.length} cố vấn
              </span>
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                {Array.from(
                  { length: Math.min(5, totalPages) },
                  (_, i) => i + 1,
                ).map((p) => (
                  <button
                    key={p}
                    className={`page-btn${currentPage === p ? " active" : ""}`}
                    onClick={() => setCurrentPage(p)}
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
                    className={`page-btn${currentPage === totalPages ? " active" : ""}`}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                )}
                <button
                  className="page-btn"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {showAddForm && (
            <div
              className="modal-overlay"
              onClick={() => setShowAddForm(false)}
            >
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <div className="modal-title">➕ Thêm Cố vấn mới</div>
                  <button
                    className="modal-close"
                    onClick={() => setShowAddForm(false)}
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleAdd}>
                  <div className="form-group">
                    <label className="form-label">Họ và Tên Cố vấn (*)</label>
                    <input
                      className="form-control"
                      placeholder="Nhập họ và tên..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thuộc Khoa (*)</label>
                    <select
                      className="form-control form-select"
                      value={newKhoa}
                      onChange={(e) => setNewKhoa(e.target.value)}
                    >
                      {khoas.map((k) => (
                        <option key={k.MaKhoa} value={k.MaKhoa}>
                          {k.TenKhoa}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Lưu cố vấn
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 1 && (
        <div className="card card-body">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                Phân công lớp cho Cố vấn
              </h3>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "var(--text-secondary)",
                  fontSize: 14,
                }}
              >
                Chọn khoa, chọn cố vấn và đánh dấu lớp cần phân công. Giao diện
                mới trực quan hơn và dễ thao tác.
              </p>
            </div>
            <button
              className="btn btn-outline"
              onClick={() => {
                setAKhoa("");
                setACvId("");
                setALops([]);
                setAData({ covans: [], lops: [] });
              }}
            >
              Làm mới
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(300px, 380px) 1fr",
              gap: 24,
            }}
          >
            <div style={{ display: "grid", gap: 20 }}>
              <div className="card card-body" style={{ padding: "18px 22px" }}>
                <div
                  style={{ marginBottom: 16, fontWeight: 700, fontSize: 15 }}
                >
                  Bước 1: Chọn Khoa
                </div>
                <div className="form-group">
                  <label className="form-label">Khoa</label>
                  <select
                    className="form-control form-select"
                    value={aKhoa}
                    onChange={(e) => handleKhoaAssign(e.target.value)}
                  >
                    <option value="">-- Chọn khoa --</option>
                    {khoas.map((k) => (
                      <option key={k.MaKhoa} value={k.MaKhoa}>
                        {k.TenKhoa}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {aKhoa && (
                <div
                  className="card card-body"
                  style={{ padding: "18px 22px" }}
                >
                  <div
                    style={{ marginBottom: 16, fontWeight: 700, fontSize: 15 }}
                  >
                    Bước 2: Chọn cố vấn & Bước 3: Chọn lớp
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cố vấn nhận lớp</label>
                    <select
                      className="form-control form-select"
                      value={aCvId}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        setACvId(selectedValue);
                        setALops(
                          aData.lops
                            .filter(
                              (l) =>
                                String(l.Id_CoVan) === String(selectedValue),
                            )
                            .map((l) => l.MaLop),
                        );
                      }}
                    >
                      <option value="">-- Chọn cố vấn --</option>
                      {aData.covans.map((c) => (
                        <option key={c.Id_CoVan} value={c.Id_CoVan}>
                          {c.TenCoVan}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Danh sách lớp</label>
                    <div
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 16,
                        padding: 14,
                        maxHeight: 300,
                        overflowY: "auto",
                        background: "var(--card-bg)",
                      }}
                    >
                      {aData.lops.map((l) => (
                        <label
                          key={l.MaLop}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 14,
                            padding: "12px 10px",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                            cursor: "pointer",
                            fontSize: 14,
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700 }}>{l.MaLop}</div>
                            <div
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: 12,
                                marginTop: 4,
                              }}
                            >
                              {l.Id_CoVan
                                ? `Đang: ${aData.covans.find((c) => c.Id_CoVan === l.Id_CoVan)?.TenCoVan || "?"}`
                                : "Chưa phân công"}
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={aLops.includes(l.MaLop)}
                            onChange={(e) => {
                              if (e.target.checked)
                                setALops((prev) => [...prev, l.MaLop]);
                              else
                                setALops((prev) =>
                                  prev.filter((x) => x !== l.MaLop),
                                );
                            }}
                          />
                        </label>
                      ))}
                      {aData.lops.length === 0 && (
                        <div
                          style={{
                            textAlign: "center",
                            color: "var(--text-secondary)",
                            padding: 24,
                          }}
                        >
                          Chưa có lớp để phân công.
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleSaveAssign}
                  >
                    💾 Xác nhận lưu phân công
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: 20 }}>
              <div className="card card-body" style={{ padding: "18px 22px" }}>
                <div
                  style={{ marginBottom: 16, fontWeight: 700, fontSize: 15 }}
                >
                  Tình trạng phân lớp
                </div>
                <div
                  className="table-wrapper"
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
                  }}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Mã Lớp</th>
                        <th>Cố vấn hiện tại</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aData.lops.length === 0 && (
                        <tr>
                          <td
                            colSpan={2}
                            style={{
                              textAlign: "center",
                              padding: 24,
                              color: "var(--text-secondary)",
                            }}
                          >
                            Chọn khoa để xem tình trạng lớp.
                          </td>
                        </tr>
                      )}
                      {aData.lops.map((l) => {
                        const cv = aData.covans.find(
                          (c) => c.Id_CoVan === l.Id_CoVan,
                        );
                        return (
                          <tr key={l.MaLop}>
                            <td style={{ fontWeight: 700 }}>{l.MaLop}</td>
                            <td>
                              {cv ? (
                                cv.TenCoVan
                              ) : (
                                <span style={{ color: "var(--danger)" }}>
                                  Chưa phân công
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                className="card card-body"
                style={{
                  padding: "18px 22px",
                  background: "rgba(37, 99, 235, 0.06)",
                  border: "1px solid rgba(37, 99, 235, 0.16)",
                }}
              >
                <div
                  style={{ marginBottom: 12, fontWeight: 700, fontSize: 15 }}
                >
                  Gợi ý sử dụng
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  <li>Chọn khoa trước để tải dữ liệu cố vấn và lớp.</li>
                  <li>Click cố vấn rồi đánh dấu các lớp muốn phân công.</li>
                  <li>Nhấn lưu để cập nhật cả các lớp đã chọn.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
