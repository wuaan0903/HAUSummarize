import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Intro from '../pages/Intro';
import MainPage from '../pages/MainPage';
import Login from '../pages/Login';
import Register from "../pages/Register";
import ProfilePage from "../pages/ProfilePage";
import AdminDashboard from "../pages/AdminDashboard";

// Thành phần ProtectedRoute để bảo vệ các tuyến đường
const ProtectedRoute = ({ children, requiredRole }) => {
  // Lấy userData từ localStorage
  let userData;
  try {
    userData = JSON.parse(localStorage.getItem("userData")) || {};
    console.log("userData:", userData); // Log để kiểm tra dữ liệu
  } catch (error) {
    console.error("Lỗi khi parse userData từ localStorage:", error);
    userData = {};
  }

  // Kiểm tra trạng thái đăng nhập và vai trò
  const isLoggedIn = !!userData && !!userData.username;
  const userRole = userData.role || "user";
  console.log("isLoggedIn:", isLoggedIn, "userRole:", userRole); // Log để kiểm tra trạng thái

  // Nếu không đăng nhập hoặc vai trò không khớp
  if (!isLoggedIn || userRole !== requiredRole) {
    console.log(`Truy cập bị từ chối. Chuyển hướng đến /main. Yêu cầu vai trò: ${requiredRole}, vai trò hiện tại: ${userRole}`);
    return <Navigate to="/main" replace />;
  }

  // Nếu hợp lệ, render thành phần con
  console.log("Truy cập được phép. Render AdminDashboard.");
  return children;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<ProfilePage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}