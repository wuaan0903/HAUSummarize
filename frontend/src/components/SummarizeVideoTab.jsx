import React, { useState,useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Delete from "@mui/icons-material/Delete";
import YouTubeIcon from "@mui/icons-material/YouTube";
import MonetizationOn from "@mui/icons-material/MonetizationOn";

import "animate.css";

const commonStyles = {
  paper: {
    p: 3,
    maxWidth: "800px",
    width: "100%",
    mx: "auto",
    background: "linear-gradient(145deg, #2e2e2e, #3e3e3e)",
    borderRadius: "20px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(160, 160, 255, 0.2)",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(160, 160, 255, 0.3)",
    },
  },
  textField: {
    background: "linear-gradient(145deg, #3e3e3e, #4e4e5e)",
    color: "white",
    borderRadius: "15px",
    padding: "10px",
    border: "1px solid rgba(160, 160, 255, 0.3)",
    transition: "all 0.3s ease",
    "&:hover": { borderColor: "rgba(160, 160, 255, 0.7)", boxShadow: "0 0 10px rgba(160, 160, 255, 0.3)" },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  },
  button: {
    color: "white",
    background: "linear-gradient(90deg, #a0a0ff, #6060ff)",
    fontWeight: 600,
    px: 5,
    py: 1.5,
    borderRadius: "25px",
    boxShadow: "0 0 15px rgba(160, 160, 255, 0.5)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(90deg, #6060ff, #a0a0ff)",
      transform: "scale(1.05)",
      boxShadow: "0 0 25px rgba(160, 160, 255, 0.7)",
    },
  },
  select: {
    background: "linear-gradient(145deg, #3e3e3e, #4e4e5e)",
    color: "white",
    borderRadius: "10px",
    "& .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(160, 160, 255, 0.3)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(160, 160, 255, 0.7)" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#a0a0ff" },
    "& .MuiSvgIcon-root": { color: "#a0a0ff" },
  },
};

const SummarizeVideoTab = ({
  inputText,
  setInputText,
  summaryResult,
  setSummaryResult,
  transcript,
  setTranscript,
  handleSummarizeVideo,
  loading,
}) => {
  const [summaryType, setSummaryType] = useState("short");
  const [error, setError] = useState("");
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const [coin, setCoin] = useState(userData.coin || 0);
  
    // Hàm gọi API để lấy coin mới nhất
    const fetchUserCoin = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/user/${userData.userId}/coin`);
        const data = await res.json();
        if (res.ok) {
          setCoin(data.coin);
  
          // Cập nhật lại localStorage nếu cần
          const updatedUser = { ...userData, coin: data.coin };
          localStorage.setItem("userData", JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error("Lỗi khi lấy số xu:", error);
      }
    };
    // Gọi coin khi vừa load component
    useEffect(() => {
      fetchUserCoin();
    }, []);

  const validateYouTubeUrl = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return regex.test(url);
  };

  const handleSummarizeClick = () => {
    if (!inputText.trim()) {
      setError("Vui lòng nhập URL video YouTube!");
      return;
    }
    if (!validateYouTubeUrl(inputText)) {
      setError("URL không hợp lệ! Vui lòng nhập URL YouTube hợp lệ.");
      return;
    }
    setError("");
    handleSummarizeVideo(summaryType); // Truyền summaryType vào hàm xử lý
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSummarizeClick();
    }
  };

  const handleSummaryTypeChange = (e) => {
    setSummaryType(e.target.value);
  };

  const handleClearTranscript = () => {
    setTranscript("");
    if (!summaryResult) setInputText("");
  };

  const handleClearSummary = () => {
    setSummaryResult("");
    if (!transcript) setInputText("");
  };

  return (
    <Box>
      <Box className="animate__animated animate__zoomIn animate__faster" sx={{ display: "flex", justifyContent: "center" }}>
        <Grid container spacing={4} sx={{ px: 2 }}>
          <Grid item xs={12} md={12} width="800px">
            <Paper sx={commonStyles.paper}>
              <Typography variant="h6" sx={{ color: "#a0a0ff", mb: 2, fontWeight: 600, textAlign: "center" ,display: "flex", justifyContent: "space-between"}}>
                Tóm tắt video YouTube
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MonetizationOn sx={{ color: "#ffff66" }} />
                  <Typography
                    sx={{
                      color: "#a0a0ff",
                      fontWeight: 600,
                      fontFamily: '"Roboto", sans-serif',
                    }}
                  >
                    {coin}
                  </Typography>
                </Box>
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Dán đường link video YouTube tại đây (VD: https://www.youtube.com/watch?v=...)"
                InputProps={{
                  startAdornment: <YouTubeIcon sx={{ color: "#ff0000", mr: 1 }} />,
                  sx: commonStyles.textField,
                }}
              />
              {error && (
                <Typography sx={{ color: "#ff4444", mt: 1, textAlign: "center" }}>
                  {error}
                </Typography>
              )}
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel sx={{ color: "#a0a0ff", "&.Mui-focused": { color: "#ffffff" } }}>
                    Kiểu tóm tắt
                  </InputLabel>
                  <Select
                    value={summaryType}
                    onChange={handleSummaryTypeChange}
                    label="Kiểu tóm tắt"
                    sx={commonStyles.select}
                  >
                    <MenuItem value="short">Tóm tắt ngắn gọn</MenuItem>
                    <MenuItem value="medium">Tóm tắt vừa phải</MenuItem>
                    <MenuItem value="detailed">Tóm tắt chi tiết</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleSummarizeClick}
                  disabled={loading}
                  sx={commonStyles.button}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Tóm Tắt →"}
                </Button>
              </Box>
              {!summaryResult && !transcript && (
                <Paper sx={{ ...commonStyles.paper, mt: 4 }}>
                  <Box sx={{ color: "white", fontSize: 16, lineHeight: 2.2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography fontWeight={600} color="#a0a0ff" component="span" sx={{ mr: 1 }}>01.</Typography>
                      <Typography>Dán đường link video YouTube vào ô nhập liệu</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography fontWeight={600} color="#a0a0ff" component="span" sx={{ mr: 1 }}>02.</Typography>
                      <Typography>Nhấn nút <b>Tóm Tắt</b> để bắt đầu xử lý</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography fontWeight={600} color="#a0a0ff" component="span" sx={{ mr: 1 }}>03.</Typography>
                      <Typography>Xem kết quả tóm tắt và sử dụng các công cụ sao chép/xóa</Typography>
                    </Box>
                  </Box>
                </Paper>
              )}
              {(summaryResult || transcript) && (
                <Box sx={{ mt: 4 }}>
                  {transcript && (
                    <Box sx={{ p: 2, mb: 2, backgroundColor: "#252535", borderRadius: "15px", color: "#a0a0ff", maxWidth: "100%", overflowWrap: "break-word", position: "relative" }}>
                      <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1 }}>
                        <IconButton size="small" onClick={() => navigator.clipboard.writeText(transcript)} color="inherit">
                          <ContentCopy fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={handleClearTranscript} color="inherit">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="h6">Nội dung trích xuất từ Video</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: "pre-line", mt: 1 }}>{transcript}</Typography>
                    </Box>
                  )}
                  {summaryResult && (
                    <Box sx={{ p: 2, backgroundColor: "#252535", borderRadius: "15px", color: "#a0a0ff", maxWidth: "100%", overflowWrap: "break-word", position: "relative" }}>
                      <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1 }}>
                        <IconButton size="small" onClick={() => navigator.clipboard.writeText(summaryResult)} color="inherit">
                          <ContentCopy fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={handleClearSummary} color="inherit">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="h6">Kết quả tóm tắt:</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: "pre-line", mt: 1 }}>{summaryResult}</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SummarizeVideoTab;