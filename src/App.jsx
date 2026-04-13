import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import AdminLayout from './layouts/AdminLayout'
import CovanLayout from './layouts/CovanLayout'
import SinhvienLayout from './layouts/SinhvienLayout'

// Admin pages
import Dashboard from './pages/admin/Dashboard'
import QuanLyCovan from './pages/admin/QuanLyCovan'
import QuanLySinhVien from './pages/admin/QuanLySinhVien'
import QuanLyTaiKhoan from './pages/admin/QuanLyTaiKhoan'
import UploadAI from './pages/admin/UploadAI'
import HuanLuyenMoHinh from './pages/admin/HuanLuyenMoHinh'

// Cố vấn pages
import TongQuan from './pages/covan/TongQuan'
import SinhVienNguyCoCao from './pages/covan/SinhVienNguyCoCao'
import DuLieuSinhVien from './pages/covan/DuLieuSinhVien'
import ThongKeCovan from './pages/covan/ThongKe'
import TaiDuLieu from './pages/covan/TaiDuLieu'

// Sinh viên pages
import ThongTinCaNhan from './pages/sinhvien/ThongTinCaNhan'
import ThongTinRuiRo from './pages/sinhvien/ThongTinRuiRo'
import DoiMatKhau from './pages/sinhvien/DoiMatKhau'

function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'covan') return <Navigate to="/covan/tong-quan" replace />
  if (user.role === 'sinhvien') return <Navigate to="/sinhvien/thong-tin" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  const { loading } = useAuth()
  if (loading) return <div className="spinner" />

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <PrivateRoute allowedRoles={['admin']}><AdminLayout /></PrivateRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="quan-ly-co-van" element={<QuanLyCovan />} />
        <Route path="quan-ly-sinh-vien" element={<QuanLySinhVien />} />
        <Route path="quan-ly-tai-khoan" element={<QuanLyTaiKhoan />} />
        <Route path="upload-ai" element={<UploadAI />} />
        <Route path="huan-luyen" element={<HuanLuyenMoHinh />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Cố vấn Routes */}
      <Route path="/covan" element={
        <PrivateRoute allowedRoles={['covan']}><CovanLayout /></PrivateRoute>
      }>
        <Route path="tong-quan" element={<TongQuan />} />
        <Route path="nguy-co-cao" element={<SinhVienNguyCoCao />} />
        <Route path="du-lieu-sinh-vien" element={<DuLieuSinhVien />} />
        <Route path="thong-ke" element={<ThongKeCovan />} />
        <Route path="tai-du-lieu" element={<TaiDuLieu />} />
        <Route index element={<Navigate to="tong-quan" replace />} />
      </Route>

      {/* Sinh viên Routes */}
      <Route path="/sinhvien" element={
        <PrivateRoute allowedRoles={['sinhvien']}><SinhvienLayout /></PrivateRoute>
      }>
        <Route path="thong-tin" element={<ThongTinCaNhan />} />
        <Route path="rui-ro" element={<ThongTinRuiRo />} />
        <Route path="doi-mat-khau" element={<DoiMatKhau />} />
        <Route index element={<Navigate to="thong-tin" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
