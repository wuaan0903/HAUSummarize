import { BrowserRouter, Routes, Route } from "react-router-dom";
import Intro from '../pages/Intro';
import MainPage from '../pages/MainPage';
import Login from '../pages/Login';
import Register from "../pages/Register";
import ProfilePage from "../pages/ProfilePage";
import AdminDashboard from "../pages/AdminDashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<ProfilePage />} />
        <Route path="/admin/" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
