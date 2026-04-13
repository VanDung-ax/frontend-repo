import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAllResults, generateAdvice } from "../../services/api";
import {
  MdCalendarToday,
  MdAccessTime,
  MdStar,
  MdMenuBook,
  MdPsychology,
  MdAttachMoney,
  MdBedtime,
  MdGroup,
  MdSportsBasketball,
  MdPlace,
  MdSchool,
  MdWarningAmber,
} from "react-icons/md";

function RiskDonut({ percent }) {
  const r = 50, size = 140;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.7;
  const fill = (arc * Math.min(percent, 100)) / 100;
  const isHigh = percent >= 65;
  const color = isHigh ? "#dc2626" : percent >= 40 ? "#d97706" : "#10b981";

  return (
    <div style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={10}
          strokeDasharray={`${arc} ${circ}`}
          transform={`rotate(126 ${cx} ${cy})`}
          strokeLinecap="round"
        />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={10}
          strokeDasharray={`${fill} ${circ}`}
          transform={`rotate(126 ${cx} ${cy})`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
        <text x={cx} y={cy + 2} textAnchor="middle" fontSize="24" fontWeight="900" fill="#fff">
          {percent.toFixed(2)}%
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="10" fontWeight="700" fill="rgba(255,255,255,0.8)" letterSpacing="1.5">
          RỦI RO
        </text>
      </svg>
    </div>
  );
}

function getLevel(val) {
  if (!val || val === "N/A") return null;
  const low = ["Low", "low", "LOW", "No", "no", "NO", "Near", "near", "NEAR", "Far", "far", "FAR"];
  const high = ["High", "high", "HIGH", "Yes", "yes", "YES", "Positive", "positive", "POSITIVE"];
  if (low.some((x) => String(val).includes(x))) return "low";
  if (high.some((x) => String(val).includes(x))) return "high";
  return "neutral";
}

function IndicatorTile({ icon, label, value, highlight, index }) {
  const level = typeof value === "string" ? getLevel(value) : null;
  
  return (
    <div className={`risk-tile ${highlight ? 'highlight' : ''}`} style={{ animationDelay: `${index * 0.05}s` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="tile-icon">
          {icon}
        </div>
        {(level === "low" || level === "high") && (
          <span className={`tile-badge badge-${level}`}>
            {level.toUpperCase()}
          </span>
        )}
      </div>
      <div className="tile-value">{value}</div>
      <div className="tile-label">{label}</div>
    </div>
  );
}

export default function ThongTinRuiRo() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const mssv = user?.linked_id;
        if (!mssv) return setLoading(false);
        const res = await getAllResults(user?.id, "khoa");
        const raw = res.data || [];
        const mine = raw.filter((r) => String(r.MSSV) === String(mssv));
        if (mine.length > 0) {
          setData(mine.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b));
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}><div className="spinner" /></div>;

  if (!data) return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-header"><h1>Thông tin rủi ro học tập</h1></div>
      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
        <h2 style={{ color: "#16a34a", marginBottom: 8 }}>Xin chúc mừng!</h2>
        <p style={{ color: "#15803d" }}>Bạn không nằm trong danh sách cảnh báo rủi ro ở đợt dự báo mới nhất.</p>
      </div>
    </div>
  );

  const score = data.risk_score || 0;
  const pct = score * 100;
  const isHigh = pct >= 65;
  const riskBg = isHigh
    ? "linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)"
    : pct >= 40
      ? "linear-gradient(135deg, #d97706 0%, #92400e 100%)"
      : "linear-gradient(135deg, #059669 0%, #064e3b 100%)";
  const riskLabel = isHigh ? "Rủi ro cao — rất đáng báo động" : pct >= 40 ? "Rủi ro trung bình" : "An toàn";

  const reasons = (() => {
    try {
      const l = typeof data.reasons === "string" ? JSON.parse(data.reasons) : data.reasons;
      return Array.isArray(l) ? [...new Set(l)] : [l];
    } catch { return [data.reasons]; }
  })();

  const TILE_KEYWORDS = {
    "Chuyên cần": ["chuyên cần", "attendance", "chuyên can", "tỉ lệ chuyên", "tỷ lệ chuyên"],
    "Giờ học": ["giờ học", "hours_studied", "thời gian học", "số giờ học", "tự học", "giờ/tuần", "giờ học thấp", "ít học"],
    "Điểm số cũ": ["điểm số", "previous_scores", "điểm cũ", "kết quả học", "điểm thấp"],
    "Tài liệu học tập": ["tài liệu", "access_to_resources", "resources", "nguồn học"],
    "Mức độ động lực": ["động lực", "motivation", "tinh thần học", "mức độ động"],
    "Thu nhập gia đình": ["thu nhập", "family_income", "kinh tế", "gia đình"],
    "Giờ ngủ": ["giờ ngủ", "sleep", "ngủ ít", "thiếu ngủ"],
    "Ảnh hưởng bạn bè": ["bạn bè", "peer", "nhóm bạn", "ảnh hưởng"],
    "Ngoại khóa": ["ngoại khóa", "extracurricular", "hoạt động ngoài"],
    "Khoảng cách": ["khoảng cách", "distance", "xa trường", "di chuyển"],
    "Chất lượng GV": ["chất lượng", "teacher_quality", "giảng viên", "giáo viên"],
  };

  const reasonsText = reasons.filter(Boolean).join(" ").toLowerCase();
  const isHighlighted = (label) => (TILE_KEYWORDS[label] || []).some((kw) => reasonsText.includes(kw.toLowerCase()));

  const tiles = [
    { icon: <MdCalendarToday />, label: "Chuyên cần", value: `${parseFloat(data.attendance) || 0}%`, highlight: isHighlighted("Chuyên cần") },
    { icon: <MdAccessTime />, label: "Giờ học", value: `${data.hours_studied || 0}H`, highlight: isHighlighted("Giờ học") },
    { icon: <MdStar />, label: "Điểm số cũ", value: data.previous_scores || 0, highlight: isHighlighted("Điểm số cũ") },
    { icon: <MdMenuBook />, label: "Tài liệu học tập", value: data.access_to_resources || "N/A", highlight: isHighlighted("Tài liệu học tập") },
    { icon: <MdPsychology />, label: "Mức độ động lực", value: data.motivation_level || "N/A", highlight: isHighlighted("Mức độ động lực") },
    { icon: <MdAttachMoney />, label: "Thu nhập gia đình", value: data.family_income || "N/A", highlight: isHighlighted("Thu nhập gia đình") },
    { icon: <MdBedtime />, label: "Giờ ngủ", value: `${data.sleep_hours || 0}H`, highlight: isHighlighted("Giờ ngủ") },
    { icon: <MdGroup />, label: "Ảnh hưởng bạn bè", value: data.peer_influence || "N/A", highlight: isHighlighted("Ảnh hưởng bạn bè") },
    { icon: <MdSportsBasketball />, label: "Ngoại khóa", value: data.extracurricular_activities || "N/A", highlight: isHighlighted("Ngoại khóa") },
    { icon: <MdPlace />, label: "Khoảng cách", value: data.distance_from_home || "N/A", highlight: isHighlighted("Khoảng cách") },
    { icon: <MdSchool />, label: "Chất lượng GV", value: data.teacher_quality || "N/A", highlight: isHighlighted("Chất lượng GV") },
  ];

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Premium Styles */}
      <style>{`
        .risk-main-card {
          border-radius: 24px;
          padding: 36px 40px;
          color: #fff;
          display: flex;
          gap: 32px;
          align-items: center;
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.25);
          position: relative;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .risk-main-card:hover {
          transform: translateY(-4px);
        }
        .risk-main-card::after {
          content: '';
          position: absolute; right: -10%; top: -20%;
          width: 50%; height: 150%;
          background: radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
          transform: rotate(20deg);
          pointer-events: none;
        }

        .risk-tile {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 4px 10px -2px rgba(0,0,0,0.03);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .risk-tile::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(37,99,235,0.03) 0%, rgba(37,99,235,0) 100%);
          opacity: 0; transition: opacity 0.3s ease;
        }
        .risk-tile:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 20px -8px rgba(37, 99, 235, 0.15);
          border-color: #93c5fd;
          z-index: 10;
        }
        .risk-tile:hover::before { opacity: 1; }
        .risk-tile:active { transform: translateY(0px) scale(0.96); }

        .risk-tile.highlight {
          background: #fef2f2; border-color: #fecaca;
        }
        .risk-tile.highlight::before {
          background: linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(220,38,38,0) 100%);
        }
        .risk-tile.highlight:hover {
          background: #fee2e2; border-color: #ef4444;
          box-shadow: 0 12px 20px -8px rgba(220, 38, 38, 0.2);
        }
        
        .tile-icon { font-size: 18px; color: #64748b; transition: all 0.3s ease; }
        .risk-tile:hover .tile-icon { color: #2563eb; transform: scale(1.1); }
        .risk-tile.highlight .tile-icon { color: #ef4444; }
        .risk-tile.highlight:hover .tile-icon { color: #dc2626; transform: scale(1.1); }

        .tile-value { font-size: 16px; font-weight: 800; color: #1e293b; transition: color 0.3s; }
        .risk-tile.highlight .tile-value { color: #991b1b; }
        .tile-label { font-size: 11px; color: #64748b; font-weight: 500; }
        .risk-tile.highlight .tile-label { color: #dc2626; font-weight: 700; }

        .tile-badge { font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 20px; letter-spacing: 0.5px; }
        .badge-low { background: #fef9c3; color: #a16207; border: 1px solid #fde047; }
        .badge-high { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }

        .info-pdf-card {
          background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
          border-radius: 18px; padding: 20px 16px;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
          color: #fff; cursor: pointer; text-align: center;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .info-pdf-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 30px rgba(15, 23, 42, 0.4);
          background: linear-gradient(145deg, #334155 0%, #1e293b 100%);
        }

        .warning-list-item {
          background: #fef2f2; border-radius: 12px; padding: 14px 16px;
          display: flex; gap: 12px; align-items: flex-start;
          transition: all 0.2s ease; border: 1px solid #fee2e2;
        }
        .warning-list-item:hover {
          background: #ffe4e6; transform: translateX(4px); border-color: #fecaca;
        }
      `}</style>

      <div className="page-header" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>Thông tin rủi ro học tập</h1>
        <p style={{ color: '#64748b' }}>Phân tích cảnh báo chuyên sâu bằng công nghệ AI sinh tạo</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1.5fr", gap: 32, marginBottom: 32 }}>
        {/* Risk main card */}
        <div className="risk-main-card" style={{ background: riskBg }}>
          <div style={{ flexShrink: 0, position: 'relative', zIndex: 2 }}>
            <RiskDonut percent={pct} />
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2,
              background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 20,
              display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16,
              backdropFilter: 'blur(4px)'
            }}>
              ⚡ Tự động giám sát
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
              {riskLabel}
            </div>
            <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6, margin: 0, paddingRight: 20 }}>
              Thuật toán trí tuệ nhân tạo (AI) đã phân tích tập hợp các chỉ số hoạt động và học tập của bạn, so sánh với hệ tham chiếu chuẩn để quy ra mức độ rủi ro hiện tại.
            </p>
          </div>
        </div>

        {/* Warnings */}
        <div style={{ background: '#ffffff', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ background: '#fee2e2', color: '#ef4444', padding: 8, borderRadius: 10 }}>
              <MdWarningAmber size={20} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#1e293b' }}>Các nguyên nhân bị đánh dấu</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reasons.filter(Boolean).map((r, i) => (
              <div key={i} className="warning-list-item">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: "#991b1b", marginBottom: 4, lineHeight: 1.4 }}>
                    {r}
                  </div>
                </div>
              </div>
            ))}
            {reasons.filter(Boolean).length === 0 && (
               <div style={{ color: "#64748b", fontSize: 14, fontStyle: 'italic', background: '#f8fafc', padding: 20, borderRadius: 12, textAlign: 'center' }}>
                 Tất cả chỉ số đều tốt, không có lỗi vi phạm.
               </div>
            )}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 20 }}>
        11 Thuộc Tính & Biến Số Đánh Giá
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, marginBottom: 20 }}>
        {tiles.map((t, i) => (
          <IndicatorTile key={i} index={i} {...t} />
        ))}
        {/* Document Tile */}
        <div className="info-pdf-card">
          <span style={{ fontSize: 32 }}>📋</span>
          <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.4, letterSpacing: '0.5px' }}>
            HỒ SƠ<br/>RỦI RO ĐẦY ĐỦ
          </div>
        </div>
      </div>
    </div>
  );
}
