import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  Grid,
  Paper,
  Button,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import workerURL from 'pdfjs-dist/build/pdf.worker.js?url';

GlobalWorkerOptions.workerSrc = workerURL;

import mammoth from "mammoth";
import "animate.css";
import axios from "axios";
import UploadFileIcon from "@mui/icons-material/UploadFile"
import Logo from "../img/58cc8d39-8cc4-486d-b0de-93e451229f62.png";
import SummarizeTextTab from "../components/SummarizeTextTab";
import SummarizeArticleTab from "../components/SummarizeArticleTab";
import SummarizeVideoTab from "../components/SummarizeVideoTab";

const MainPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [inputText, setInputText] = useState("");
  const [summaryResult, setSummaryResult] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaryType, setSummaryType] = useState("short"); // Giá trị mặc định là "short"
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const userDataString = localStorage.getItem("userData");
  const userData = userDataString ? JSON.parse(userDataString) : null;

  useEffect(() => {
    setSummaryResult("");
    setInputText("");
    setExtractedText("");
  }, [tabIndex]);

  const addAlert = (message, severity) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, severity }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 6000);
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleSelectHistory = (item) => {
    setInputText(item.content);
    setSummaryResult(item.summary);
    setTabIndex(0);
    setSidebarOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      if (file.type === "application/pdf") {
        readPDF(file);
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        readWord(file);
      } else {
        addAlert("Vui lòng tải lên tệp PDF hoặc Word.", "error");
      }
    }
  };

  const readPDF = (file) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const typedArray = new Uint8Array(reader.result);
  
      pdfjsLib.getDocument(typedArray).promise
        .then((pdf) => {
          const pagesPromises = [];
  
          for (let i = 1; i <= pdf.numPages; i++) {
            pagesPromises.push(
              pdf.getPage(i).then((page) =>
                page.getTextContent().then((content) => {
                  return content.items.map((item) => item.str).join(" ");
                })
              )
            );
          }
  
          Promise.all(pagesPromises).then((pagesText) => {
            const fullText = pagesText.join("\n");
            setInputText(fullText); // ✅ dùng state React thay vì document.getElementById
          });
        })
        .catch((error) => {
          addAlert("Không thể đọc file PDF!", "error");
          console.error(error);
        });
    };
  
    reader.readAsArrayBuffer(file);
  };
  

  const readWord = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      mammoth
        .extractRawText({ arrayBuffer })
        .then((result) => {
          let text = result.value;
        
          // Xử lý: loại bỏ nhiều dòng trống liên tiếp thành 1
          text = text.replace(/\n\s*\n+/g, '\n\n');
        
          // Loại bỏ dòng trống đầu và cuối
          text = text.trim();
        
          setInputText(text);
          addAlert("Đã tải nội dung từ file Word.", "success");
        })
        .catch((err) => {
          console.error("Error reading Word file:", err);
          addAlert("Lỗi khi đọc file Word.", "error");
        });
    };
    reader.readAsArrayBuffer(file);
  };

const handleSummarize = async (summaryType) => {
  if (!inputText.trim()) {
    addAlert("Vui lòng nhập văn bản cần tóm tắt!", "warning");
    return;
  }

  // Ước lượng số token: 1 từ ~0.75 token, 340 từ ~1024 token
  const wordCount = inputText.split(/\s+/).length;
  const isLongText = wordCount > 340; // ~1024 token

  if (isLongText) {
    const confirmUseCoin = window.confirm(
      "Văn bản quá dài! Bạn có muốn sử dụng 1 xu để tóm tắt không?"
    );
    if (!confirmUseCoin) {
      addAlert("Đã hủy tóm tắt.", "info");
      return;
    }
    if (!userData) {
      addAlert("Vui lòng đăng nhập để tóm tắt văn bản dài!", "warning");
      return;
    }
  }

  try {
    setLoading(true);
    const response = await axios.post("http://localhost:5000/api/summarize", {
      user_id: userData?.userId ?? null, // Gửi null cho văn bản ngắn
      text: inputText,
      summary_type: summaryType,
    });
    setSummaryResult(response.data.summary);
    setExtractedText(response.data.full_text);
    if (response.data.coin !== undefined) {
      // Cập nhật coin nếu user đăng nhập và trừ coin
      const updatedUserData = { ...userData, coin: response.data.coin };
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
      addAlert(
        `Tóm tắt thành công! Đã sử dụng 1 xu. Còn lại: ${response.data.coin} xu.`,
        "success"
      );
    } else {
      addAlert("Tóm tắt thành công!", "success");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      const errorMsg = error.response.data.error;
      if (errorMsg.includes("Không đủ coin")) {
        addAlert("Không đủ xu để tóm tắt! Vui lòng nạp thêm xu.", "error");
      } else if (errorMsg.includes("Cần đăng nhập")) {
        addAlert("Vui lòng đăng nhập để tóm tắt văn bản dài!", "error");
      } else {
        addAlert(errorMsg, "error");
      }
    } else {
      addAlert("Đã có lỗi xảy ra, xin vui lòng thử lại sau.", "error");
    }
  } finally {
    setLoading(false);
  }
};

  const handleSummarizePost = async (summaryType) => {
    if (!inputText.trim()) {
      addAlert("Vui lòng nhập link bài viết để tóm tắt", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/summarize-article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: inputText,
          user_id: userData?.userId ?? null,
          summary_type: summaryType,
        }),
      });
      const data = await res.json();

      if (data.summary && data.full_text) {
        setSummaryResult(data.summary);
        setExtractedText(data.full_text);
      } else {
        setSummaryResult("Không thể tóm tắt nội dung từ liên kết này.");
        addAlert("Không thể tóm tắt nội dung từ liên kết này.", "error");
      }
    } catch (error) {
      setSummaryResult("Đã có lỗi xảy ra khi xử lý.");
      addAlert("Đã có lỗi xảy ra khi xử lý.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #1e1e1e 30%, #2a2a3a 90%)",
        color: "white",
        minHeight: "100vh",
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
            "radial-gradient(circle at 50% 30%, rgba(50, 50, 100, 0.2), transparent 70%)",
          zIndex: 0,
        },
      }}
    >
      <Header onOpenSidebar={handleOpenSidebar} />
      <Sidebar
        open={sidebarOpen}
        onClose={handleCloseSidebar}
        onSelectHistory={handleSelectHistory}
      />

      {/* Alerts */}
      <Box
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 1300,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          maxWidth: "400px",
        }}
      >
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            severity={alert.severity}
            onClose={() => removeAlert(alert.id)}
            className="animate__animated animate__fadeInRight animate__faster"
            sx={{
              background: "linear-gradient(90deg, #6060ff, #a0a0ff)",
              color: "#ffffff",
              borderRadius: "10px",
              boxShadow: "0 0 15px rgba(160, 160, 255, 0.5)",
              fontFamily: '"Roboto", sans-serif',
              "& .MuiAlert-icon": {
                color: "#ffffff",
              },
              "& .MuiAlert-action": {
                color: "#ffffff",
              },
            }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => removeAlert(alert.id)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {alert.message}
          </Alert>
        ))}
      </Box>

      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 3,
          pt: 3,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent={"center"}
          mb={2}
        >
          <img
            src={Logo}
            alt="Logo"
            style={{ width: 45, height: 45, marginRight: 8 }}
          />
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              background: "linear-gradient(90deg, #ffffff, #a0a0ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "animate__animated animate__fadeInDown animate__slow",
            }}
          >
            HAUSummarize
          </Typography>
        </Box>
        <Typography
          variant="subtitle1"
          sx={{
            textAlign: "center",
            mb: 4,
            color: "#a0a0ff",
            fontWeight: 500,
            fontSize: 18,
            fontFamily: '"Roboto", sans-serif',
            animation: "animate__animated animate__fadeIn animate__delay-1s",
          }}
        >
          Ứng dụng công nghệ{" "}
          <span style={{ color: "#ffcc00", fontWeight: "bold" }}>
            xử lý ngôn ngữ tự nhiên
          </span>{" "}
          trong tóm tắt văn bản và tài liệu,
          <br />
          phục vụ công tác học tập và nghiên cứu tại{" "}
          <span style={{ color: "#ff8080", fontWeight: "bold" }}>
            Trường Đại học Kiến trúc Hà Nội
          </span>
          .
        </Typography>

        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          centered
          sx={{
            mb: 4,
            "& .MuiTab-root": {
              color: "#a0a0ff",
              fontWeight: 600,
              fontSize: 16,
              textTransform: "none",
              fontFamily: '"Roboto", sans-serif',
              padding: "12px 24px",
              borderRadius: "25px",
              transition: "all 0.3s ease",
              background: "rgba(255, 255, 255, 0.05)",
              mx: 1,
              "&:hover": {
                background: "rgba(160, 160, 255, 0.1)",
                transform: "scale(1.07)",
                boxShadow: "0 0 10px rgba(160, 160, 255, 0.4)",
              },
            },
            "& .MuiTab-root.Mui-selected": {
              background: "linear-gradient(90deg, #6c6cff, #a0a0ff)",
              color: "#ffffff !important",
              boxShadow: "0 0 20px rgba(160, 160, 255, 0.6)",
              transform: "scale(1.1)",
            },
            "& .MuiTabs-flexContainer": {
              justifyContent: "center",
            },
            "& .MuiTabs-indicator": {
              display: "none",
            },
          }}
        >
          <Tab label="📝 Tóm tắt văn bản" />
          <Tab label="🌐 Tóm tắt bài viết" />
          <Tab label="🎥 Tóm tắt video" />
        </Tabs>

        {tabIndex === 0 && (
          <SummarizeTextTab
            inputText={inputText}
            setInputText={setInputText}
            summaryResult={summaryResult}
            setSummaryResult={setSummaryResult}
            extractedText={extractedText}
            handleSummarize={handleSummarize}
            handleFileChange={handleFileChange}
            loading={loading}
          />
        )}

        {tabIndex === 1 && (
          <Box
            className="animate__animated animate__fadeInUp animate__faster"
            sx={{
              p: 3,
              width: "100%",
              maxWidth: "800px",
              mx: "auto",
              background: "linear-gradient(145deg, #2e2e2e, #3e3e3e)",
              borderRadius: "20px",
              boxShadow:
                "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(160, 160, 255, 0.2)",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow:
                  "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(160, 160, 255, 0.3)",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "#a0a0ff", mb: 2 }}>
              Nhập liên kết bài viết
            </Typography>

            <TextField
              fullWidth
              variant="outlined"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Dán link bài viết vào đây (ví dụ: https://example.com/bai-viet)"
              InputProps={{
                sx: {
                  background: "linear-gradient(145deg, #3e3e3e, #4e4e5e)",
                  color: "white",
                  borderRadius: "15px",
                  padding: "10px",
                  border: "1px solid rgba(160, 160, 255, 0.3)",
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

            <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>


            <FormControl sx={{ minWidth: 200 }}>
                          <InputLabel id="summary-type-label" sx={{ fontWeight: 600 , color: "white"}}>Chọn loại tóm tắt</InputLabel>
                          <Select
                            labelId="summary-type-label"
                            id="summary-type"
                            value={summaryType}
                            label="Chọn loại tóm tắt"
                            onChange={(e) => setSummaryType(e.target.value)}
                            sx={{
                              border: "2px solid rgba(160, 160, 255, 0.3)",
                              borderColor: "rgba(160, 160, 255, 0.3)",
                              
                              color: "white",
                              borderRadius: "25px",
                              fontWeight: 500,
                              paddingLeft: "10px",
                              paddingRight: "10px",
                              transition: "all 0.3s ease",
                              "& .MuiSelect-icon": {
                                color: "white", // Đổi màu cho icon dropdown
                              },
                              "&:hover": {
                                borderColor: "rgba(160, 160, 255, 0.7)",
                                boxShadow: "0 0 15px rgba(160, 160, 255, 0.5)",
                              },
                            }}
                          >
                            <MenuItem value="short" sx={{ fontWeight: 600 , px:5,py:1.5 }}>Tóm tắt ngắn gọn</MenuItem>
                            <MenuItem value="medium" sx={{ fontWeight: 600 , px:5,py:1.5 }}>Tóm tắt vừa phải</MenuItem>
                            <MenuItem value="detailed" sx={{ fontWeight: 600 , px:5,py:1.5 }}>Tóm tắt chi tiết</MenuItem>
                          </Select>
                        </FormControl>
              <Button
                variant="contained"
                onClick={handleSummarizePost}
                disabled={loading}
                sx={{
                  color: "white",
                  background: "linear-gradient(90deg, #a0a0ff, #6060ff)",
                  fontWeight: 600,
                  px: 5,
                  py: 1.5,
                  borderRadius: "35px",
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
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-line", mt: 1 }}
                >
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
                      "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(160, 160, 255, 0.3)",
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
                    <Typography component="span">
                      Truy cập vào website{" "}
                      <a
                        href="https://hau.edu.vn/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#a0a0ff",
                          textDecoration: "underline",
                          fontWeight: 500,
                        }}
                      >
                        https://hau.edu.vn/
                      </a>
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
                      Copy đường link bài viết bạn muốn tóm tắt
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography
                      fontWeight={600}
                      color="#a0a0ff"
                      component="span"
                      sx={{ mr: 1 }}
                    >
                      03.
                    </Typography>
                    <Typography>
                      Dán đường link vào ô input phía trên
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      fontWeight={600}
                      color="#a0a0ff"
                      component="span"
                      sx={{ mr: 1 }}
                    >
                      04.
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
          </Box>
        )}

        {tabIndex === 2 && <SummarizeVideoTab />}
      </Box>
    </Box>
  );
};

export default MainPage;