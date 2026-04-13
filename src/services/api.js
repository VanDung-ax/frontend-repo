import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: 30000,
});

// ── Auth ──────────────────────────────────────────────
export const login = (username, password) =>
  api.post("/api/auth/login", { username, password });

// ── Dashboard ─────────────────────────────────────────
export const getDashboardStats = () => api.get("/api/data/dashboard-stats");

export const getAllResults = (userId, scope = "all") =>
  api.get("/api/data/all-results", { params: { user_id: userId, scope } });

export const getTrainHistory = () => api.get("/api/data/train-history");

// ── Cố vấn ────────────────────────────────────────────
export const getAllCovan = () => api.get("/api/covan/all");
export const addCovan = (data) => api.post("/api/covan/add", data);
export const deleteCovan = (id) => api.delete(`/api/covan/delete/${id}`);

// ── Khoa & Lớp ───────────────────────────────────────
export const getKhoaList = () => api.get("/api/khoa-list");
export const getAssignData = (maKhoa) => api.get(`/api/assign-data/${maKhoa}`);
export const assignLop = (data) => api.post("/api/assign-lop", data);

// ── Sinh viên ─────────────────────────────────────────
export const getAllStudents = () => api.get("/api/student/all");
export const getStudent = (mssv) => api.get(`/api/student/${mssv}`);
export const addStudent = (data) => api.post("/api/student/add", data);
export const updateStudent = (mssv, data) =>
  api.put(`/api/student/update/${mssv}`, data);
export const deleteStudent = (mssv) =>
  api.delete(`/api/student/delete/${mssv}`);

// ── Tài khoản ─────────────────────────────────────────
export const getAllAccounts = () => api.get("/api/account/all");
export const addAccount = (data) => api.post("/api/account/add", data);
export const updateAccount = (id, data) =>
  api.put(`/api/account/update/${id}`, data);
export const deleteAccount = (id) => api.delete(`/api/account/delete/${id}`);

// ── Upload & AI ───────────────────────────────────────
export const uploadPredict = (file, userId) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/api/upload-predict?user_id=${userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const retrainModel = (file, userId) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/api/retrain-model?user_id=${userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const syncTree = (userId) =>
  api.post(`/api/sync-latest-tree?user_id=${userId}`);

// ── Advice ────────────────────────────────────────────
// File: src/services/api.js (Phương án dự phòng)
export const generateAdvice = (mssv, reasons = []) => {
  // Chuyển mảng lý do thành chuỗi văn bản để khớp với BaseModel tại Backend
  const riskReasonsText = Array.isArray(reasons) ? reasons.join(". ") : reasons;

  return api.post(`/api/advice/generate/${mssv}`, {
    risk_reasons: riskReasonsText || "",
  });
};

export default api;
