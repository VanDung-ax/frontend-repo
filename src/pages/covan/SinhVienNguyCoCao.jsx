import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAllResults, generateAdvice } from "../../services/api";
import {
  MdExpandMore,
  MdExpandLess,
  MdWarning,
  MdSchool,
  MdPsychology,
  MdSearch,
  MdAccountTree,
  MdBarChart,
} from "react-icons/md";

const BG = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#db2777", "#dc2626"];
function colorFor(name) {
  let s = 0;
  for (const c of name || "") s += c.charCodeAt(0);
  return BG[s % BG.length];
}

function getInitials(name) {
  if (!name) return "?";
  const words = name.trim().split(" ");
  if (words.length >= 2) {
    return (
      words[words.length - 2][0] + words[words.length - 1][0]
    ).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatAdviceText(text) {
  if (!text) return null;
  // Bỏ các dấu gạch đứng |
  const cleanedText = text.replace(/\|/g, "");
  
  return cleanedText.split("\n").map((line, idx) => {
    // Basic bold parsing for **text**
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <div key={idx} style={{ minHeight: "1rem", marginBottom: "4px" }}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </div>
    );
  });
}

export default function SinhVienNguyCoCao() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [advices, setAdvices] = useState({});
  const [advLoading, setAdvLoading] = useState({});
  const [searchMSSV, setSearchMSSV] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAllResults(user?.id, "assigned");
        const raw = res.data || [];
        const map = {};
        raw.forEach((r) => {
          if (
            !map[r.MSSV] ||
            new Date(r.created_at) > new Date(map[r.MSSV].created_at)
          )
            map[r.MSSV] = r;
        });
        const atRisk = Object.values(map).filter(
          (s) => (s.risk_score || 0) >= 0.65,
        );
        setStudents(
          atRisk.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0)),
        );
      } catch {}
      setLoading(false);
    }
    load();
  }, [user]);

  const classes = [...new Set(students.map((s) => s.Lop).filter(Boolean))];

  const filteredStudents = students.filter((s) => {
    const matchClass = classes.length === 0 || s.Lop === classes[activeTab];
    const matchMSSV =
      s.MSSV.toLowerCase().includes(searchMSSV.toLowerCase()) ||
      s.HoTen.toLowerCase().includes(searchMSSV.toLowerCase());
    return matchClass && matchMSSV;
  });

  // Tìm đến hàm handleAdvice trong file SinhVienNguyCoCao.jsx và sửa lại:

  const handleAdvice = async (mssv) => {
    setAdvLoading((p) => ({ ...p, [mssv]: true }));
    try {
      // Tìm đối tượng sinh viên hiện tại trong danh sách để lấy reasons
      const student = students.find((s) => s.MSSV === mssv);
      const reasons = student?.reasons || [];

      // Gửi kèm reasons để tránh lỗi 422 (FastAPI yêu cầu AdvicePayload)
      const r = await generateAdvice(mssv, reasons);

      const adviceText = r.data?.advice || r.data;
      setAdvices((p) => ({
        ...p,
        [mssv]: adviceText || "Không có lời khuyên.",
      }));
    } catch (err) {
      // In lỗi chi tiết ra console để debug nếu vẫn lỗi
      console.error("Lỗi từ Backend:", err.response?.data);
      setAdvices((p) => ({ ...p, [mssv]: "Lỗi kết nối máy chủ AI." }));
    }
    setAdvLoading((p) => ({ ...p, [mssv]: false }));
  };
  if (loading)
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );

  return (
    <div
      style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "40px" }}
    >
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#0f172a",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <MdWarning color="#ef4444" /> Giám sát Nguy cơ cao
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Cảnh báo {students.length} sinh viên rủi ro học thuật ≥ 65%
          </p>
        </div>
        <div style={{ position: "relative", width: "300px" }}>
          <MdSearch
            style={{
              position: "absolute",
              left: 12,
              top: 12,
              color: "#94a3b8",
            }}
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm MSSV hoặc Tên..."
            value={searchMSSV}
            onChange={(e) => setSearchMSSV(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 10px 10px 40px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          paddingBottom: "16px",
          marginBottom: "24px",
        }}
      >
        {classes.map((cls, i) => (
          <button
            key={cls}
            onClick={() => {
              setActiveTab(i);
              setSearchMSSV("");
            }}
            className={`tab-pill ${activeTab === i ? "active" : ""}`}
          >
            Lớp {cls}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredStudents.map((s) => {
          const mssv = s.MSSV;
          const isOpen = expanded[mssv];
          const reasons = s.reasons || [];
          const aiPath = (() => {
            try {
              return typeof s.ai_explanation_path === "string"
                ? JSON.parse(s.ai_explanation_path)
                : s.ai_explanation_path || [];
            } catch {
              return [];
            }
          })();

          // CHỈ TÌM CÁC THUỘC TÍNH BỊ CẢNH BÁO TRONG PHẦN "LÝ DO", KHÔNG TÍNH AI PATH VÌ ĐÓ CHỈ LÀ ĐƯỜNG ĐI LOGIC
          const reasonsText = reasons.filter(Boolean).join(" ").toLowerCase();

          const TILE_KEYWORDS = {
            "Chuyên cần": ["chuyên cần", "attendance", "vắng", "bỏ tiết", "nghỉ học", "đi học"],
            "Giờ học": ["giờ học", "hours_studied", "tự học", "số giờ", "thời gian học", "thời gian dành"],
            "Điểm cũ": ["điểm", "previous_scores", "gpa", "kết quả", "kỳ trước", "học lực", "nền tảng"],
            "Tài liệu": ["tài liệu", "access_to_resources", "resources", "nguồn học", "sách", "tài nguyên"],
            "Động lực": ["động lực", "motivation", "tinh thần", "chán nản", "thái độ", "áp lực", "niềm vui"],
            "Gia đình": ["thu nhập", "family_income", "kinh tế", "gia đình", "tài chính", "hoàn cảnh"],
            "Giờ ngủ": ["ngủ", "sleep", "thức khuya"],
            "Bạn bè": ["bạn", "peer", "giao tiếp", "môi trường xung quanh"],
            "Ngoại khóa": ["ngoại khóa", "extracurricular", "câu lạc bộ", "phong trào", "thể thao", "hoạt động"],
            "Khoảng cách": ["khoảng cách", "distance", "chỗ ở", "đi lại", "trọ", "xa trường", "di chuyển", "nơi ở"],
            "Giáo viên": ["giáo viên", "teacher", "giảng viên", "thầy", "cô", "truyền đạt"],
          };
          const isHighlighted = (label) => (TILE_KEYWORDS[label] || []).some((kw) => reasonsText.includes(kw.toLowerCase()));

          // MẢNG 11 THUỘC TÍNH
          const features = [
            { label: "Chuyên cần", val: `${s.attendance}%` },
            { label: "Giờ học", val: `${s.hours_studied}h` },
            { label: "Điểm cũ", val: s.previous_scores },
            { label: "Giờ ngủ", val: `${s.sleep_hours}h` },
            { label: "Tài liệu", val: s.access_to_resources },
            { label: "Động lực", val: s.motivation_level },
            { label: "Gia đình", val: s.family_income },
            { label: "Bạn bè", val: s.peer_influence },
            { label: "Ngoại khóa", val: s.extracurricular_activities },
            { label: "Khoảng cách", val: s.distance_from_home },
            { label: "Giáo viên", val: s.teacher_quality },
          ];

          return (
            <div
              key={mssv}
              className="risk-card"
              style={{
                border: isOpen ? "1px solid #3b82f6" : "1px solid #e2e8f0",
              }}
            >
              <div
                className="card-header"
                onClick={() => setExpanded((p) => ({ ...p, [mssv]: !p[mssv] }))}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <div
                    className="avatar-circle"
                    style={{ background: colorFor(s.HoTen) }}
                  >
                    {getInitials(s.HoTen)}
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", color: "#0f172a" }}>
                      {s.HoTen}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {mssv} • Ngành {s.Nganh}
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "20px" }}
                >
                  <div className="risk-score-badge">
                    {(s.risk_score * 100).toFixed(2)}%
                  </div>
                  {isOpen ? (
                    <MdExpandLess size={24} />
                  ) : (
                    <MdExpandMore size={24} />
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="card-body-expanded">
                  {/* PHẦN MỚI: CHI TIẾT 11 THUỘC TÍNH */}
                  <div className="section-title">
                    <MdBarChart /> Phân tích 11 chỉ số dữ liệu
                  </div>
                  <div className="features-grid">
                    {features.map((f, idx) => {
                      const hl = isHighlighted(f.label);
                      return (
                        <div key={idx} className={`feature-item ${hl ? 'highlighted-feature' : ''}`}>
                          <div className={`f-label ${hl ? 'f-label-hl' : ''}`}>{f.label}</div>
                          <div className={`f-val ${hl ? 'f-val-hl' : ''}`}>{f.val}</div>
                        </div>
                      )
                    })}
                  </div>
                  {aiPath.length > 0 && (
                    <div className="ai-path-section">
                      <div className="section-title">
                        <MdAccountTree /> Suy luận logic từ AI
                      </div>
                      <div className="ai-path-box">
                        {aiPath.map((line, idx) => (
                          <div
                            key={idx}
                            className={`path-line ${line.includes("==>") ? "final" : ""}`}
                          >
                            {line.trim().replace(/"/g, "")}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="section-title">🚩 Lý do cảnh báo</div>
                  <div className="reasons-list">
                    {reasons.map((r, i) => (
                      <div key={i} className="reason-item">
                        📍 {r}
                      </div>
                    ))}
                  </div>
                  <div className="advice-section">
                    {/* 1. Nếu vừa nhấn nút và đang có lời khuyên mới trong State */}
                    {advices[mssv] ? (
                      <div className="advice-box">
                        <div style={{ marginBottom: "8px" }}>
                          <strong>🤖 Lời khuyên AI (Mới):</strong>
                        </div>
                        {formatAdviceText(advices[mssv])}
                      </div>
                    ) : /* 2. Nếu đã có lời khuyên cũ được lưu trong Database (logic saved_advices bên Streamlit) */
                    s.advices && s.advices.length > 0 ? (
                      <div
                        className="advice-box"
                        style={{
                          background: "#f0fdf4",
                          borderColor: "#bcf0da",
                        }}
                      >
                        {s.advices.map((adv, idx) => (
                          <div
                            key={idx}
                            style={{
                              marginBottom: s.advices.length > 1 ? "16px" : "0",
                              borderBottom:
                                idx < s.advices.length - 1
                                  ? "1px dashed #a7f3d0"
                                  : "none",
                              paddingBottom:
                                idx < s.advices.length - 1 ? "12px" : "0",
                            }}
                          >
                            <div style={{ marginBottom: "8px" }}>
                              <strong>🤖 Lời khuyên AI (Đã lưu):</strong>
                            </div>
                            {formatAdviceText(adv)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* 3. Nếu chưa có gì thì mới hiện nút bấm */
                      <button
                        onClick={() => handleAdvice(mssv)}
                        disabled={advLoading[mssv]}
                        className="advice-btn"
                      >
                        <MdPsychology />
                        {advLoading[mssv]
                          ? "Đang phân tích..."
                          : "Nhận lộ trình hỗ trợ AI"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .tab-pill { padding: 8px 20px; border-radius: 99px; background: #f1f5f9; border: none; cursor: pointer; font-weight: 600; color: #475569; white-space: nowrap; }
        .tab-pill.active { background: #0f172a; color: white; }
        .risk-card { background: white; border-radius: 12px; overflow: hidden; margin-bottom: 12px; transition: all 0.2s; }
        .card-header { padding: 15px 20px; display: flex; justify-content: space-between; cursor: pointer; align-items: center; }
        .avatar-circle { width: 44px; height: 44px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .risk-score-badge { background: #fee2e2; color: #dc2626; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 15px; }
        .card-body-expanded { padding: 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
        .section-title { font-size: 12px; font-weight: 800; color: #64748b; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        
        /* Layout cho 11 thuộc tính */
        .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; margin-bottom: 24px; }
        .feature-item { background: white; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
        .feature-item.highlighted-feature { background: #fef2f2; border-color: #fca5a5; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1); }
        .f-label { font-size: 10px; color: #94a3b8; font-weight: 700; margin-bottom: 4px; }
        .f-label-hl { color: #ef4444; }
        .f-val { font-size: 14px; color: #1e293b; font-weight: 700; }
        .f-val-hl { color: #991b1b; }

        .ai-path-box { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 10px; font-family: 'Consolas', monospace; font-size: 12px; margin-bottom: 24px; line-height: 1.6; border-left: 4px solid #3b82f6; }
        .path-line.final { color: #fbbf24; font-weight: 700; margin-top: 12px; border-top: 1px solid #334155; padding-top: 8px; font-size: 13px; }
        .reason-item { background: #fffbeb; border: 1px solid #fef3c7; color: #92400e; padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; font-size: 13px; font-weight: 500; }
        .advice-box { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 18px; border-radius: 10px; font-size: 14px; line-height: 1.6; }
        .advice-btn { background: #4f46e5; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: 700; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
      `}</style>
    </div>
  );
}
