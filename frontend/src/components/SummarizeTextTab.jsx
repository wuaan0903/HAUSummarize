import React, { useState } from "react";
import {
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Delete from "@mui/icons-material/Delete";
import MonetizationOn from "@mui/icons-material/MonetizationOn";

const SummarizeTextTab = ({
  inputText,
  setInputText,
  summaryResult,
  extractedText,
  setSummaryResult,
  handleSummarize,
  handleFileChange,
  loading,
}) => {
  const [summaryType, setSummaryType] = useState("short");
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const coin = userData.coin || 0;

  const handleSummaryTypeChange = (event) => {
    setSummaryType(event.target.value);
  };

  const handleSummarizeClick = () => {
    handleSummarize(summaryType);
  };

  return (
    <Box>
      <Box
        className="animate__animated animate__zoomIn animate__faster"
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <Grid container spacing={4} sx={{ px: 2 }}>
          <Grid item xs={12} md={12} width="800px">
            <Paper
              sx={{
                p: 3,
                maxWidth: "800px",
                width: "100%",
                mx: "auto",
                background: "linear-gradient(145deg, #2e2e2e, #3e3e3e)",
                borderRadius: "20px",
                boxShadow:
                  "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(160, 160, 255, 0.2)",
                animation: "animate__animated animate__fadeInUp animate__slow",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow:
                    "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(160, 160, 255, 0.3)",
                },
              }}
            >
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  sx={{
                    color: "#a0a0ff",
                    borderColor: "#a0a0ff",
                    backgroundColor: "transparent",
                    fontWeight: 600,
                    borderRadius: "10px",
                    padding: "8px 16px",
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
                  Tải lên tài liệu
                  <input
                    type="file"
                    accept=".pdf, .docx"
                    style={{ opacity: 0, position: "absolute" }}
                    onChange={handleFileChange}
                  />
                </Button>
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
              </Box>

              <TextField
                fullWidth
                multiline
                rows={8}
                variant="outlined"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Copy và dán văn bản cần tóm tắt vào ô này"
                InputProps={{
                  sx: {
                    background: "linear-gradient(145deg, #3e3e3e, #4e4e5e)",
                    color: "white",
                    borderRadius: "15px",
                    padding: "10px",
                    border: "1px solid rgba(160, 160, 255, 0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "rgba(160, 160, 255, 0.7)",
                      boxShadow: "0 0 10px rgba(160, 160, 255, 0.3)",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  },
                }}
              />

              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel
                    sx={{ color: "#a0a0ff", "&.Mui-focused": { color: "#ffffff" } }}
                  >
                    Kiểu tóm tắt
                  </InputLabel>
                  <Select
                    value={summaryType}
                    onChange={handleSummaryTypeChange}
                    label="Kiểu tóm tắt"
                    sx={{
                      background: "linear-gradient(145deg, #3e3e3e, #4e4e5e)",
                      color: "white",
                      borderRadius: "10px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "1px solid rgba(160, 160, 255, 0.3)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(160, 160, 255, 0.7)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#a0a0ff",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "#a0a0ff",
                      },
                    }}
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
                  sx={{
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
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "Tóm Tắt →"
                  )}
                </Button>
              </Box>

                    {extractedText && (
                      <Box
                        sx={{
                          mt: 4,
                          p: 2,
                          backgroundColor: "#1a1a2a",
                          borderRadius: "15px",
                          color: "#ddddff",
                          overflowWrap: "break-word",
                        }}
                      >
                        <Typography variant="h6" sx={{ color: "#a0a0ff" }}>
                          Văn bản gốc:
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: "pre-line", mt: 1 }}>
                          {extractedText}
                        </Typography>
                      </Box>
                    )}

              

              {!summaryResult && (
                <Paper
                  sx={{
                    p: 4,
                    marginTop: 4,
                    background: "linear-gradient(145deg, #2e2e2e, #3e3e3e)",
                    borderRadius: "20px",
                    boxShadow:
                      "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(160, 160, 255, 0.2)",
                    animation: "animate__animated animate__zoomIn animate__slow",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow:
                        "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px RGBA(160, 160, 255, 0.3)",
                    },
                  }}
                >
                  <Box sx={{ color: "white", fontSize: 16, lineHeight: 2.2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography
                        fontWeight={600}
                        color="#a0a0ff"
                        component="span"
                        sx={{ mr: 1 }}
                      >
                        01.
                      </Typography>
                      <Typography>
                        Nhập dữ liệu hoặc dán dữ liệu vào ô bên trái
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography
                        fontWeight={600}
                        color="#a0a0ff"
                        component="span"
                        sx={{ mr: 1 }}
                      >
                        02.
                      </Typography>
                      <Typography>
                        Chọn kiểu tóm tắt: ngắn gọn, ý chính hoặc chi tiết
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        fontWeight={600}
                        color="#a0a0ff"
                        component="span"
                        sx={{ mr: 1 }}
                      >
                        03.
                      </Typography>
                      <Typography>
                        Bấm nút <b>Tóm Tắt</b> và tận hưởng kết quả
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}




              {summaryResult && (
                <Box
                  sx={{
                    mt: 4,
                    p: 2,
                    backgroundColor: "#252535",
                    borderRadius: "15px",
                    color: "#a0a0ff",
                    maxWidth: "100%",
                    overflowWrap: "break-word",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => navigator.clipboard.writeText(summaryResult)}
                      color="inherit"
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setSummaryResult("")}
                      color="inherit"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography variant="h6">Kết quả tóm tắt:</Typography>
                  <Typography
                    variant="body1"
                    sx={{ whiteSpace: "pre-line", mt: 1 }}
                  >
                    {summaryResult}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SummarizeTextTab;