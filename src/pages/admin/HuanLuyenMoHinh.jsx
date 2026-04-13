import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { retrainModel, syncTree, getTrainHistory } from "../../services/api";
import {
  MdCloudUpload,
  MdSync,
  MdPlayArrow,
  MdCheckCircle,
  MdWarning,
  MdInsertDriveFile,
  MdHistory,
} from "react-icons/md";

export default function HuanLuyenMoHinh() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const inputRef = useRef();

  const loadHistory = async () => {
    try {
      const r = await getTrainHistory();
      const data = r.data || [];
      setHistory(data);
    } catch {}
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRetrain = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const r = await retrainModel(file, user?.id);
      setResult({
        type: "success",
        text: r.data?.message || "Đã gửi yêu cầu huấn luyện thành công!",
      });
      setFile(null);
    } catch (err) {
      setResult({
        type: "danger",
        text: err.response?.data?.detail || "Lỗi khi gửi yêu cầu huấn luyện.",
      });
    }
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const r = await syncTree(user?.id);
      setSyncResult({
        type: "success",
        text: r.data?.message || "Đồng bộ cây quyết định thành công!",
      });
      await loadHistory();
    } catch (err) {
      setSyncResult({
        type: "danger",
        text: err.response?.data?.detail || "Đồng bộ thất bại.",
      });
    }
    setSyncing(false);
  };

  const getStatusBadge = (item, i) => {
    if (i === 0)
      return (
        <span
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "700",
            display: "inline-block",
          }}
        >
          ĐANG SỬ DỤNG
        </span>
      );
    if (String(item.version || "").includes("Failed"))
      return (
        <span
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "700",
            display: "inline-block",
          }}
        >
          BÀN LỖI
        </span>
      );
    return (
      <button
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          color: "#475569",
          padding: "6px 16px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseOver={(e) => {
          e.target.style.borderColor = "#cbd5e1";
          e.target.style.background = "#f8fafc";
        }}
        onMouseOut={(e) => {
          e.target.style.borderColor = "#e2e8f0";
          e.target.style.background = "#fff";
        }}
      >
        Khôi phục
      </button>
    );
  };

  return (
    <div
      style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "40px" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#0f172a",
              marginBottom: "8px",
            }}
          >
            Huấn luyện Mô hình AI
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: "15px",
              maxWidth: "600px",
              lineHeight: "1.5",
            }}
          >
            Cập nhật dữ liệu để tái huấn luyện thuật toán, giúp hệ thống dự báo
            rủi ranh học tập chính xác hơn.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#fff",
              border: "1px solid #cbd5e1",
              color: "#334155",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: syncing ? "not-allowed" : "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              transition: "all 0.2s",
            }}
          >
            <MdSync
              size={18}
              style={{
                animation: syncing ? "spin 1s linear infinite" : "none",
              }}
            />
            {syncing ? "Đang đồng bộ..." : "Đồng bộ từ máy chủ AI"}
          </button>
        </div>
      </div>

      {result && (
        <div
          style={{
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: result.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: result.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${result.type === "success" ? "#a7f3d0" : "#fecaca"}`,
          }}
        >
          {result.type === "success" ? (
            <MdCheckCircle size={20} />
          ) : (
            <MdWarning size={20} />
          )}
          <span style={{ fontWeight: "500" }}>{result.text}</span>
        </div>
      )}

      {syncResult && (
        <div
          style={{
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: syncResult.type === "success" ? "#eff6ff" : "#fef2f2",
            color: syncResult.type === "success" ? "#1e40af" : "#991b1b",
            border: `1px solid ${syncResult.type === "success" ? "#bfdbfe" : "#fecaca"}`,
          }}
        >
          {syncResult.type === "success" ? (
            <MdCheckCircle size={20} />
          ) : (
            <MdWarning size={20} />
          )}
          <span style={{ fontWeight: "500" }}>{syncResult.text}</span>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(auto, 420px) 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Box Upload */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "6px",
              }}
            >
              Cung cấp dữ liệu học
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b" }}>
              Tải lên file <strong>.csv</strong> chứa danh sách sinh viên cùng
              các thuộc tính huấn luyện.
            </p>
          </div>

          <div
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${file ? "#3b82f6" : "#cbd5e1"}`,
              borderRadius: "12px",
              padding: "40px 20px",
              textAlign: "center",
              background: file ? "#eff6ff" : "#f8fafc",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: "20px",
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              hidden
              onChange={(e) => setFile(e.target.files[0] || null)}
            />

            {file ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    background: "#dbeafe",
                    color: "#2563eb",
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                  }}
                >
                  <MdInsertDriveFile size={28} />
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    color: "#1e3a8a",
                    fontSize: "14px",
                  }}
                >
                  {file.name}
                </div>
                <div
                  style={{
                    color: "#3b82f6",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  Nhấn để chọn file khác
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div style={{ color: "#94a3b8", marginBottom: "12px" }}>
                  <MdCloudUpload size={48} />
                </div>
                <div
                  style={{
                    fontWeight: "600",
                    color: "#475569",
                    fontSize: "14px",
                  }}
                >
                  Nhấn để tải dữ liệu lên
                </div>
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "12px",
                    marginTop: "6px",
                  }}
                >
                  Định dạng CSV (Tối đa 50MB)
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleRetrain}
            disabled={loading || !file}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              background: !file || loading ? "#e2e8f0" : "#2563eb",
              color: "#fff",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "14px",
              border: "none",
              cursor: !file || loading ? "not-allowed" : "pointer",
            }}
          >
            <MdPlayArrow size={20} />
            {loading ? "Đang xử lý..." : "Bắt đầu huấn luyện"}
          </button>
        </div>

        {/* Bảng History (Đã bỏ cột Tác giả) */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #f1f5f9",
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <MdHistory size={22} color="#475569" />
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#0f172a",
                margin: 0,
              }}
            >
              Lịch sử Phiên bản
            </h3>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#fff",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <th
                    style={{
                      padding: "16px 24px",
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    Phiên bản
                  </th>
                  <th
                    style={{
                      padding: "16px 24px",
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    Thời gian cập nhật
                  </th>
                  <th
                    style={{
                      padding: "16px 24px",
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      textAlign: "center",
                    }}
                  >
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      style={{ padding: "60px 20px", textAlign: "center" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            background: "#f1f5f9",
                            padding: "16px",
                            borderRadius: "50%",
                            color: "#94a3b8",
                          }}
                        >
                          <MdCloudUpload size={32} />
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: "700",
                              color: "#334155",
                              fontSize: "15px",
                            }}
                          >
                            Chưa có dữ liệu huấn luyện
                          </div>
                          <div
                            style={{
                              color: "#64748b",
                              fontSize: "13px",
                              marginTop: "4px",
                            }}
                          >
                            Hãy tải lên file CSV để bắt đầu.
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  history.map((item, i) => {
                    const hasError = String(item.version || "").includes(
                      "Failed",
                    );
                    return (
                      <tr
                        key={item.version || i}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={{ padding: "16px 24px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <div
                              style={{
                                background: hasError ? "#fee2e2" : "#dbeafe",
                                color: hasError ? "#ef4444" : "#2563eb",
                                padding: "6px",
                                borderRadius: "6px",
                              }}
                            >
                              <MdInsertDriveFile size={16} />
                            </div>
                            <span
                              style={{
                                fontWeight: "700",
                                color: "#0f172a",
                                fontSize: "14px",
                              }}
                            >
                              {item.version || `v${i + 1}`}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "16px 24px",
                            color: "#475569",
                            fontSize: "14px",
                          }}
                        >
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString("vi-VN")
                            : "—"}
                        </td>
                        <td
                          style={{ padding: "16px 24px", textAlign: "center" }}
                        >
                          {getStatusBadge(item, i)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
