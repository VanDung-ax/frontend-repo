// src/services/api.js
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api";

// Tạo một instance của axios
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchDashboardStats = async () => {
  try {
    const response = await apiClient.get("/data/dashboard-stats");
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy thống kê:", error);
    return { total_sinhvien: 0, total_covan: 0, total_taikhoan: 0 };
  }
};

export const fetchAllStudentData = async () => {
  try {
    const response = await apiClient.get("/data/all-results");
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy dữ liệu sinh viên:", error);
    return [];
  }
};

// ... Bạn có thể bổ sung các hàm fetch_students, fetch_advisors... tương tự file utils.py cũ vào đây sau.

export default apiClient;
