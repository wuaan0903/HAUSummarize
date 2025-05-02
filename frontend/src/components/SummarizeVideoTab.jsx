import React from "react";
import {
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Delete from "@mui/icons-material/Delete";
import YouTubeIcon from "@mui/icons-material/YouTube";
import "animate.css";

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
  const handleSummarizeClick = () => {
    if (!inputText.trim()) return;
    handleSummarizeVideo();
  };

  return (
    <Box>
      <Box className="animate__animated animate__zoomIn animate__faster" sx={{ display: "flex", justifyContent: "center" }}>
        <Grid container spacing={4} sx={{ px: 2 }}>
          <Grid item xs={12} md={12} width="800px">
            <Paper sx={{ p: 3, maxWidth: "800px", width: "100%", mx: "auto", background: "linear-gradient(145deg, #2e2e2e, #3e3e3e)", borderRadius: "20px", boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(160, 160, 255, 0.2)", animation: "animate__animated animate__fadeInUp animate__slow", transition: "transform 0.3s ease", "&:hover": { transform: "translateY(-5px)", boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(160, 160, 255, 0.3)" } }}>
              <Typography variant="h6" sx={{ color: "#a0a0ff", mb: 2, fontWeight: 600, textAlign: "center" }}>
                Tóm tắt video YouTube
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Dán đường link video YouTube tại đây (VD: https://www.youtube.com/watch?v=...)"
                InputProps={{
                  startAdornment: <YouTubeIcon sx={{ color: "#ff0000", mr: 1 }} />,
                  sx: { background: "linear-gradient(145deg, #3e3e3e, #4e4e5e)", color: "white", borderRadius: "15px", padding: "10px", border: "1px solid rgba(160, 160, 255, 0.3)", transition: "all 0.3s ease", "&:hover": { borderColor: "rgba(160, 160, 255, 0.7)", boxShadow: "0 0 10px rgba(160, 160, 255, 0.3)" }, "& .MuiOutlinedInput-notchedOutline": { border: "none" } },
                }}
              />
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  onClick={handleSummarizeClick}
                  disabled={loading}
                  sx={{ color: "white", background: "linear-gradient(90deg, #a0a0ff, #6060ff)", fontWeight: 600, px: 5, py: 1.5, borderRadius: "25px", boxShadow: "0 0 15px rgba(160, 160, 255, 0.5)", transition: "all 0.3s ease", "&:hover": { background: "linear-gradient(90deg, #6060ff, #a0a0ff)", transform: "scale(1.05)", boxShadow: "0 0 25px rgba(160, 160, 255, 0.7)" } }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Tóm Tắt →"}
                </Button>
              </Box>
              {!summaryResult && !transcript && (
                <Paper sx={{ p: 4, marginTop: 4, background: "linear-gradient(145deg, #2e2e2e, #3e3e3e)", borderRadius: "20px", boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(160, 160, 255, 0.2)", animation: "animate__animated animate__zoomIn animate__slow", transition: "transform 0.3s ease", "&:hover": { transform: "translateY(-5px)", boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(160, 160, 255, 0.3)" } }}>
                  <Box sx={{ color: "white", fontSize: 16, lineHeight: 2.2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}><Typography fontWeight={600} color="#a0a0ff" component="span" sx={{ mr: 1 }}>01.</Typography><Typography>Dán đường link video YouTube vào ô nhập liệu</Typography></Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}><Typography fontWeight={600} color="#a0a0ff" component="span" sx={{ mr: 1 }}>02.</Typography><Typography>Nhấn nút <b>Tóm Tắt</b> để bắt đầu xử lý</Typography></Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}><Typography fontWeight={600} color="#a0a0ff" component="span" sx={{ mr: 1 }}>03.</Typography><Typography>Xem kết quả tóm tắt và sử dụng các công cụ sao chép/xóa</Typography></Box>
                  </Box>
                </Paper>
              )}
              {(summaryResult || transcript) && (
                <Box sx={{ mt: 4 }}>
                  {transcript && (
                    <Box sx={{ p: 2, mb: 2, backgroundColor: "#252535", borderRadius: "15px", color: "#a0a0ff", maxWidth: "100%", overflowWrap: "break-word", position: "relative" }}>
                      <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1 }}>
                        <IconButton size="small" onClick={() => navigator.clipboard.writeText(transcript)} color="inherit"><ContentCopy fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => { setTranscript(""); if (!summaryResult) setInputText(""); }} color="inherit"><Delete fontSize="small" /></IconButton>
                      </Box>
                      <Typography variant="h6">Nội dung chuyển từ âm thanh:</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: "pre-line", mt: 1 }}>{transcript}</Typography>
                    </Box>
                  )}
                  {summaryResult && (
                    <Box sx={{ p: 2, backgroundColor: "#252535", borderRadius: "15px", color: "#a0a0ff", maxWidth: "100%", overflowWrap: "break-word", position: "relative" }}>
                      <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1 }}>
                        <IconButton size="small" onClick={() => navigator.clipboard.writeText(summaryResult)} color="inherit"><ContentCopy fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => { setSummaryResult(""); if (!transcript) setInputText(""); }} color="inherit"><Delete fontSize="small" /></IconButton>
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