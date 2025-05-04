import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

const Header = ({ onOpenSidebar }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const isLoggedIn = !!userData && !!userData.username; // Đảm bảo username hợp lệ
  const username = userData.username || "";
  const role = userData.role || "user"; // Lấy role, mặc định là "user" nếu không có
  const avatarInitial = username ? username[0].toUpperCase() : "U"; // Mặc định là "U" nếu không có username

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData"); // Xóa userData khỏi localStorage
    handleClose();
    navigate("/main"); // Chuyển hướng về trang chính
  };

  const handleAccount = () => {
    navigate("/account");
    handleClose();
  };

  const handleAdmin = () => {
    navigate("/admin");
    handleClose();
  };

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/login");
      setLoading(false);
    }, 1000); // Giả lập delay để hiển thị loading
  };

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: "#1e1e1e",
        color: "white",
        boxShadow: "none",
        borderBottom: "1px solid #444",
        width: "100%",
        maxWidth: "none",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "none",
          px: 2,
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          onClick={onOpenSidebar}
          aria-label="menu"
        >
          <MenuIcon />
        </IconButton>

        <Box>
          {isLoggedIn ? (
            <>
              <IconButton onClick={handleMenuOpen}>
                <Avatar sx={{ bgcolor: "#a0a0ff" }}>{avatarInitial}</Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    bgcolor: "#1e1e1e",
                    color: "white",
                  },
                }}
              >
                <MenuItem onClick={handleAccount}>Tài Khoản</MenuItem>
                {role === "admin" && (
                  <MenuItem onClick={handleAdmin}>Trang Admin</MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={handleLogin}
              disabled={loading}
              sx={{
                color: "white",
                background: "linear-gradient(90deg, #a0a0ff, #6060ff)",
                fontWeight: 600,
                px: 2,
                py: 1,
                borderRadius: "25px",
                boxShadow: "0 0 15px rgba(160, 160, 255, 0.5)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(90deg, #6060ff, #a0a0ff)",
                  transform: "scale(1.05)",
                  boxShadow: "0 0 25px rgba(160, 160, 255, 0.7)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Đăng nhập"
              )}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;