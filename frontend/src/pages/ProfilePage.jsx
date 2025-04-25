import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  Person,
  Email,
  Lock,
  MonetizationOn,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "animate.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const [username, setUsername] = useState(userData.username || "");
  const [email, setEmail] = useState(userData.email || "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const coin = userData.coin || 0;

  // Lấy chữ cái đầu tiên của username làm avatar
  const avatarInitial = username ? username[0].toUpperCase() : "?";

  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: "", email: "", password: "" };

    if (!username) {
      newErrors.username = "Vui lòng nhập tên tài khoản!";
      isValid = false;
    }

    if (!email) {
      newErrors.email = "Vui lòng nhập email!";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email không hợp lệ!";
      isValid = false;
    }

    if (password && password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự!";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updatedUserData = {
        ...userData,
        username,
        email,
        ...(password && { password }),
      };
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
      setSuccessMessage("Cập nhật thông tin thành công!");
      setSuccessOpen(true);
      setPassword("");
    } catch (err) {
      console.error("Update error:", err);
      setSuccessMessage("Cập nhật thất bại! Vui lòng thử lại.");
      setSuccessOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNapCoin = () => {
    setSuccessMessage("Tính năng nạp coin đang được phát triển!");
    setSuccessOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleCloseSuccess = () => {
    setSuccessOpen(false);
  };

  // Style chung cho TextField
  const textFieldStyles = {
    background: "linear-gradient(145deg, #2a2a3a, #3a3a4a)",
    color: "white",
    borderRadius: "15px",
    padding: "10px",
    border: "1px solid rgba(160, 160, 255, 0.4)",
    transition: "all 0.3s ease",
    "&:hover": {
      borderColor: "rgba(160, 160, 255, 0.8)",
      boxShadow: "0 0 12px rgba(160, 160, 255, 0.4)",
    },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #1a1a2e 30%, #2e2e4a 90%)",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        "&:before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 50% 20%, rgba(80, 80, 150, 0.3), transparent 70%)",
          zIndex: 0,
        },
      }}
    >
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          background: "linear-gradient(145deg, #25253a, #35354a)",
          borderRadius: "25px",
          boxShadow:
            "0 10px 40px rgba(0, 0, 0, 0.4), 0 0 25px rgba(160, 160, 255, 0.3)",
          animation: "animate__animated animate__zoomIn animate__slow",
          transition: "transform 0.3s ease",
          maxWidth: "800px",
          width: "100%",
          zIndex: 1,
          backdropFilter: "blur(8px)",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow:
              "0 15px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(160, 160, 255, 0.4)",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
          {/* Cột trái: Avatar và thông tin coin */}
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: "auto",
                border: "3px solid #a0a0ff",
                background: "linear-gradient(145deg, #a0a0ff, #6060ff)",
                fontSize: "48px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              {avatarInitial}
            </Avatar>
            <Typography
              variant="h5"
              sx={{
                mt: 2,
                fontFamily: '"Orbitron", sans-serif',
                background: "linear-gradient(90deg, #ffffff, #a0a0ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {username || "Người dùng"}
            </Typography>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 1 }}>
              <MonetizationOn sx={{ color: "#ffd700" }} />
              <Typography sx={{ color: "#ffd700", fontFamily: '"Roboto", sans-serif' }}>
                {coin} Coin
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleNapCoin}
              sx={{
                mt: 2,
                color: "white",
                background: "linear-gradient(90deg, #ffd700, #ffaa00)",
                fontWeight: 600,
                py: 1.5,
                borderRadius: "25px",
                boxShadow: "0 0 15px rgba(255, 215, 0, 0.5)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(90deg, #ffaa00, #ffd700)",
                  transform: "scale(1.05)",
                  boxShadow: "0 0 25px rgba(255, 215, 0, 0.7)",
                },
              }}
            >
              Nạp Coin
            </Button>
          </Box>

          {/* Cột phải: Form chỉnh sửa */}
          <Box sx={{ flex: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <Box
              component="form"
              onSubmit={handleUpdateProfile}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <TextField
                fullWidth
                variant="outlined"
                label="Tên tài khoản"
                placeholder="Nhập tên tài khoản"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!!errors.username}
                helperText={errors.username}
                InputLabelProps={{
                  sx: { color: "#a0a0ff", fontFamily: '"Roboto", sans-serif' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: "#a0a0ff" }} />
                    </InputAdornment>
                  ),
                  sx: textFieldStyles,
                }}
                sx={{ "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" } }}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="Email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                InputLabelProps={{
                  sx: { color: "#a0a0ff", fontFamily: '"Roboto", sans-serif' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "#a0a0ff" }} />
                    </InputAdornment>
                  ),
                  sx: textFieldStyles,
                }}
                sx={{ "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" } }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    color: "white",
                    background: "linear-gradient(90deg, #a0a0ff, #6060ff)",
                    fontWeight: 600,
                    py: 1.5,
                    borderRadius: "25px",
                    boxShadow: "0 0 15px rgba(160, 160, 255, 0.5)",
                    transition: "all 0.3s ease",
                    flex: 1,
                    "&:hover": {
                      background: "linear-gradient(90deg, #6060ff, #a0a0ff)",
                      transform: "scale(1.05)",
                      boxShadow: "0 0 25px rgba(160, 160, 255, 0.7)",
                    },
                    "&:disabled": {
                      background: "rgba(160, 160, 255, 0.5)",
                      cursor: "not-allowed",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "Cập Nhật"
                  )}
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate("/main")}
                  sx={{
                    color: "#a0a0ff",
                    borderColor: "#a0a0ff",
                    fontWeight: 600,
                    py: 1.5,
                    borderRadius: "25px",
                    flex: 1,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#ffffff",
                      borderColor: "#ffffff",
                      backgroundColor: "rgba(160, 160, 255, 0.2)",
                      boxShadow: "0 0 15px rgba(160, 160, 255, 0.5)",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  Về Trang Chính
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Nút đăng xuất và toggle theme */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              color: "white",
              background: "linear-gradient(90deg, #ff6b6b, #ff8c8c)",
              fontWeight: 600,
              py: 1.5,
              borderRadius: "25px",
              boxShadow: "0 0 15px rgba(255, 107, 107, 0.5)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(90deg, #ff8c8c, #ff6b6b)",
                transform: "scale(1.05)",
                boxShadow: "0 0 25px rgba(255, 107, 107, 0.7)",
              },
            }}
 InnoDB
          >
            Đăng Xuất
          </Button>

          <IconButton onClick={toggleTheme} sx={{ color: "#a0a0ff" }}>
            {theme === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>

        <Snackbar
          open={successOpen}
          autoHideDuration={3000}
          onClose={handleCloseSuccess}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ animation: "animate__animated animate__bounceInDown" }}
        >
          <Alert
            severity={successMessage.includes("thành công") ? "success" : "error"}
            sx={{
              background: "linear-gradient(145deg, #2a2a3a, #3a3a4a)",
              color: "#a0a0ff",
              border: "1px solid rgba(160, 160, 255, 0.5)",
              boxShadow: "0 0 15px rgba(160, 160, 255, 0.3)",
              fontFamily: '"Roboto", sans-serif',
              fontWeight: 600,
              "& .MuiAlert-icon": { color: "#a0a0ff" },
            }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default ProfilePage;