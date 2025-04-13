import React, { useState, useEffect } from 'react';
import Header from "../components/Header";
import {
  Card,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import ContentCopy from '@mui/icons-material/ContentCopy';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import 'animate.css';
import axios from 'axios';
import Logo from '../img/58cc8d39-8cc4-486d-b0de-93e451229f62.png'; // thay bằng đường dẫn ảnh của bạn

const MainPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [inputText, setInputText] = useState('');

  const [summaryResult, setSummaryResult] = useState('');
  const [extractedText, setExtractedText] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    // Khi tab thay đổi, reset kết quả tóm tắt
    setSummaryResult("");
    setInputText("");
    setExtractedText("");
  }, [tabIndex]);


  const [loading, setLoading] = useState(false);
  
  
  

  // Xử lý khi tải lên file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      if (file.type === 'application/pdf') {
        readPDF(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        readWord(file);
      } else {
        alert('Vui lòng tải lên tệp PDF hoặc Word.');
      }
    }
  };

// Đọc nội dung file PDF
const readPDF = (file) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const pdfData = new Uint8Array(event.target.result);
    pdfjsLib.getDocument(pdfData).promise.then((pdf) => {
      let text = '';
      const numPages = pdf.numPages;
      
      // Hàm để trích xuất văn bản từ từng trang
      const extractPageText = (pageNum) => {
        return pdf.getPage(pageNum).then((page) => {
          return page.getTextContent().then((textContent) => {
            textContent.items.forEach((item) => {
              text += item.str + ' ';
            });
          });
        });
      };

      // Sử dụng Promise.all để chờ tất cả các trang xử lý xong
      const pagePromises = [];
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        pagePromises.push(extractPageText(pageNum));
      }

      // Khi tất cả các trang đã trích xuất xong, cập nhật vào inputText
      Promise.all(pagePromises).then(() => {
        setInputText(text); // Cập nhật văn bản vào TextField
      });
    }).catch((error) => {
      console.error('Lỗi khi xử lý PDF:', error);
    });
  };
  reader.readAsArrayBuffer(file);
};


  // Đọc nội dung file Word
  const readWord = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      mammoth.extractRawText({ arrayBuffer })
        .then((result) => {
          setInputText(result.value);
        })
        .catch((err) => {
          console.error('Error reading Word file:', err);
        });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      alert("Vui lòng nhập văn bản cần tóm tắt!");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/summarize', { text: inputText });
      setSummaryResult(response.data.summary);
    } catch (error) {
      console.error("Lỗi khi gọi API tóm tắt:", error);
      alert("Đã có lỗi xảy ra khi gọi API.");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizePost = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/summarize-article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: inputText }),
      });
      const data = await res.json();

      if (data.summary && data.full_text) {
        setSummaryResult(data.summary);
        setExtractedText(data.full_text);  // thêm biến state để hiển thị văn bản gốc
      } else {
        setSummaryResult("Không thể tóm tắt nội dung từ liên kết này.");
      }
    } catch (error) {
      setSummaryResult("Đã có lỗi xảy ra khi xử lý.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #1e1e1e 30%, #2a2a3a 90%)',
      color: 'white',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 30%, rgba(50, 50, 100, 0.2), transparent 70%)',
        zIndex: 0,
      },
    }}>
      <Header />

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, pt: 3, position: 'relative', zIndex: 1 }}>
        
        <Box display="flex" alignItems="center" justifyContent={"center"} mb={2}>
          <img src={Logo} alt="Logo" style={{ width: 45, height: 45, marginRight: 8 }} />
          <Typography variant="h4" sx={{
          textAlign: 'center',
          

          fontWeight: 700,
          background: 'linear-gradient(90deg, #ffffff, #a0a0ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'animate__animated animate__fadeInDown animate__slow',
        }}>
          HAUSummarize
        </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{
          textAlign: 'center',
          mb: 4,
          color: '#a0a0ff',
          fontWeight: 500,
          fontSize: 18,
          fontFamily: '"Roboto", sans-serif',
          animation: 'animate__animated animate__fadeIn animate__delay-1s',
        }}>
          Ứng dụng công nghệ{' '}
  <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>
    xử lý ngôn ngữ tự nhiên
  </span>{' '}
  trong tóm tắt văn bản và tài liệu,<br />
  phục vụ công tác học tập và nghiên cứu tại{' '}
  <span style={{ color: '#ff8080', fontWeight: 'bold' }}>
    Trường Đại học Kiến trúc Hà Nội
  </span>.
        </Typography>

        <Tabs
  value={tabIndex}
  onChange={(e, newValue) => setTabIndex(newValue)}
  centered
  sx={{
    mb: 4,
    '& .MuiTab-root': {
      color: '#a0a0ff',
      fontWeight: 600,
      fontSize: 16,
      textTransform: 'none',
      fontFamily: '"Roboto", sans-serif',
      padding: '12px 24px',
      borderRadius: '25px',
      transition: 'all 0.3s ease',
      background: 'rgba(255, 255, 255, 0.05)',
      mx: 1,
      '&:hover': {
        background: 'rgba(160, 160, 255, 0.1)',
        transform: 'scale(1.07)',
        boxShadow: '0 0 10px rgba(160, 160, 255, 0.4)',
      },
    },
    '& .MuiTab-root.Mui-selected': {
      background: 'linear-gradient(90deg, #6c6cff, #a0a0ff)',
      color: '#ffffff !important',
      boxShadow: '0 0 20px rgba(160, 160, 255, 0.6)',
      transform: 'scale(1.1)',
    },
    '& .MuiTabs-flexContainer': {
      justifyContent: 'center',
    },
    '& .MuiTabs-indicator': {
      display: 'none', // Ẩn indicator để tab "selected" nổi bật hơn
    },
  }}
>
  <Tab label="📝 Tóm tắt văn bản" />
  <Tab label="🌐 Tóm tắt bài viết" />
  <Tab label="🎥 Tóm tắt video" />
</Tabs>

        {tabIndex === 0 && (
          <Box>
            {/* Nội dung Tóm tắt văn bản */}
            <Box
            className="animate__animated animate__zoomIn animate__faster"
            sx={{ display: 'flex', justifyContent: 'center' }}>
              
                  <Grid container spacing={4} sx={{  px: 2 }}>
                    <Grid item xs={12} md={12} width="800px">
                      <Paper
                        sx={{
                          p: 3,
                          maxWidth: '800px', // đặt cụ thể thay vì 100%
                          width: '100%',     // để nội dung vẫn responsive trong phạm vi maxWidth       // Giữ cố định độ rộng tối đa
                          mx: 'auto',                // Căn giữa
                          background: 'linear-gradient(145deg, #2e2e2e, #3e3e3e)',
                          borderRadius: '20px',
                          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(160, 160, 255, 0.2)',
                          animation: 'animate__animated animate__fadeInUp animate__slow',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(160, 160, 255, 0.3)',
                          },
                        }}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<UploadFileIcon />}
                          sx={{
                            mb: 2,
                            color: '#a0a0ff',
                            borderColor: '#a0a0ff',
                            backgroundColor: 'transparent',
                            fontWeight: 600,
                            borderRadius: '10px',
                            padding: '8px 16px',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              color: '#ffffff',
                              borderColor: '#ffffff',
                              backgroundColor: 'rgba(160, 160, 255, 0.2)',
                              boxShadow: '0 0 15px rgba(160, 160, 255, 0.5)',
                              transform: 'scale(1.05)',
                            },
                          }}
                        >
                          Upload Doc
                          <input
                            type="file"
                            accept=".pdf, .docx"
                            style={{ opacity: 0, position: 'absolute' }}
                            onChange={handleFileChange}
                          />
                        </Button>

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
                              background: 'linear-gradient(145deg, #3e3e3e, #4e4e5e)',
                              color: 'white',
                              borderRadius: '15px',
                              padding: '10px',
                              border: '1px solid rgba(160, 160, 255, 0.3)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: 'rgba(160, 160, 255, 0.7)',
                                boxShadow: '0 0 10px rgba(160, 160, 255, 0.3)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                              },
                            },
                          }}
                        />

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                          <Button
                            variant="contained"
                            onClick={handleSummarize}
                            disabled={loading}
                            sx={{
                              color: 'white',
                              background: 'linear-gradient(90deg, #a0a0ff, #6060ff)',
                              fontWeight: 600,
                              px: 5,
                              py: 1.5,
                              borderRadius: '25px',
                              boxShadow: '0 0 15px rgba(160, 160, 255, 0.5)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #6060ff, #a0a0ff)',
                                transform: 'scale(1.05)',
                                boxShadow: '0 0 25px rgba(160, 160, 255, 0.7)',
                              },
                            }}
                          >
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Tóm Tắt →"}
                          </Button>
                        </Box>

                        {!summaryResult && (
                          <Paper
                            sx={{
                              p: 4,
                              marginTop: 4,
                              background: 'linear-gradient(145deg, #2e2e2e, #3e3e3e)',
                              borderRadius: '20px',
                              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(160, 160, 255, 0.2)',
                              animation: 'animate__animated animate__zoomIn animate__slow',
                              transition: 'transform 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(160, 160, 255, 0.3)',
                              },
                            }}
                          >
                            <Box sx={{ color: 'white', fontSize: 16, lineHeight: 2.2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography fontWeight={600} color="#a0a0ff" component="span" sx={{ mr: 1 }}>
                                  01.
                                </Typography>
                                <Typography>Nhập dữ liệu hoặc dán dữ liệu vào ô bên trái</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography fontWeight={600} color="#a0a0ff" component="span" sx={{ mr: 1 }}>
                                  02.
                                </Typography>
                                <Typography>Chọn tùy chọn: tóm tắt ngắn gọn hay tóm tắt ý chính</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography fontWeight={600} color="#a0a0ff" component="span" sx={{ mr: 1 }}>
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
                              backgroundColor: '#252535',
                              borderRadius: '15px',
                              color: '#a0a0ff',
                              maxWidth: '100%',
                              overflowWrap: 'break-word',
                              position: 'relative' // Cho phép đặt icon ở góc
                            }}
                          >
                            {/* Nút Copy và Xoá */}
                            <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                              <IconButton size="small" onClick={() => navigator.clipboard.writeText(summaryResult)} color="inherit">
                                <ContentCopy fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => setSummaryResult('')} color="inherit">
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>

                            <Typography variant="h6">Kết quả tóm tắt:</Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                              {summaryResult}
                            </Typography>
                          </Box>
                        )}

                      </Paper>
                    </Grid>
                  </Grid>
            </Box>

            
            

          </Box>
        )}

        {tabIndex === 1 && (
          <Box
          className="animate__animated animate__fadeInUp animate__faster"
          sx={{
            p: 3,
            width: '100%',
          maxWidth: '800px',  // hoặc 90% nếu bạn muốn rộng hơn
          mx: 'auto', // căn giữa ngang
            background: 'linear-gradient(145deg, #2e2e2e, #3e3e3e)',
            borderRadius: '20px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(160, 160, 255, 0.2)',
            transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(160, 160, 255, 0.3)',
                          },
          }}
        >

          <Typography variant="h6" sx={{ color: '#a0a0ff', mb: 2 }}>
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
                background: 'linear-gradient(145deg, #3e3e3e, #4e4e5e)',
                color: 'white',
                borderRadius: '15px',
                padding: '10px',
                border: '1px solid rgba(160, 160, 255, 0.3)',
                '&:hover': {
                  borderColor: 'rgba(160, 160, 255, 0.7)',
                  boxShadow: '0 0 10px rgba(160, 160, 255, 0.3)',
                  
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              },
            }}
          />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
                            variant="contained"
                            onClick={handleSummarizePost}
                            disabled={loading}
                            sx={{
                              color: 'white',
                              background: 'linear-gradient(90deg, #a0a0ff, #6060ff)',
                              fontWeight: 600,
                              px: 5,
                              py: 1.5,
                              borderRadius: '25px',
                              boxShadow: '0 0 15px rgba(160, 160, 255, 0.5)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #6060ff, #a0a0ff)',
                                transform: 'scale(1.05)',
                                boxShadow: '0 0 25px rgba(160, 160, 255, 0.7)',
                              },
                            }}
                          >
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Tóm Tắt →"}
                          </Button>
          </Box>
          {extractedText && (
            <Box
              sx={{
                mt: 4,
                p: 2,
                backgroundColor: '#1a1a2a',
                borderRadius: '15px',
                color: '#ddddff',
                overflowWrap: 'break-word',
              }}
            >
              <Typography variant="h6" sx={{ color: '#a0a0ff' }}>Văn bản gốc:</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                {extractedText}
              </Typography>
            </Box>
          )}
                                  {!summaryResult && (
                          <Paper
                            sx={{
                              p: 4,
                              marginTop: 4,
                              background: 'linear-gradient(145deg, #2e2e2e, #3e3e3e)',
                              borderRadius: '20px',
                              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(160, 160, 255, 0.2)',
                              animation: 'animate__animated animate__zoomIn animate__slow',
                              transition: 'transform 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(160, 160, 255, 0.3)',
                              },
                            }}
                          >
                            <Box sx={{ color: 'white', fontSize: 16, lineHeight: 2.2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Typography fontWeight={600} color="#a0a0ff" component="span" sx={{ mr: 1 }}>
                                01.
                              </Typography>
                              <Typography component="span">
                                Truy cập vào website&nbsp;
                                <a
                                  href="https://hau.edu.vn/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: '#a0a0ff',
                                    textDecoration: 'underline',
                                    fontWeight: 500
                                  }}
                                >
                                  https://hau.edu.vn/
                                </a>
                              </Typography>
                            </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography fontWeight={600} color="#a0a0ff" component="span" sx={{ mr: 1 }}>
                                  02.
                                </Typography>
                                <Typography>Copy đường link bài viết bạn muốn tóm tắt</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography fontWeight={600} color="#a0a0ff" component="span" sx={{ mr: 1 }}>
                                  03.
                                </Typography>
                                <Typography>Dán đường link vào ô input phía trên</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography fontWeight={600} color="#a0a0ff" component="span" sx={{ mr: 1 }}>
                                  04.
                                </Typography>
                                <Typography>
                                   Bâm nút <b>Tóm Tắt</b> và tận hưởng kết quả
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
                              backgroundColor: '#252535',
                              borderRadius: '15px',
                              color: '#a0a0ff',
                              maxWidth: '100%',
                              overflowWrap: 'break-word',
                              position: 'relative' // Cho phép đặt icon ở góc
                            }}
                          >
                            {/* Nút Copy và Xoá */}
                            <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                              <IconButton size="small" onClick={() => navigator.clipboard.writeText(summaryResult)} color="inherit">
                                <ContentCopy fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => setSummaryResult('')} color="inherit">
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>

                            <Typography variant="h6">Kết quả tóm tắt:</Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                              {summaryResult}
                            </Typography>
                          </Box>
                        )}
        </Box>

        )}

{tabIndex === 2 && (
  <Box>
    {/* Nội dung Tóm tắt video */}
    <Typography variant="h6" sx={{ color: '#a0a0ff', mb: 2 }}>Tóm tắt video YouTube</Typography>
    <Typography variant="body1" sx={{ color: '#ccc' }}>Chức năng này đang được phát triển...</Typography>
  </Box>
)}



              

        
      </Box>
      {/* <Typography
          variant="body2"
          sx={{
            mt: 5,
            textAlign: 'center',
            color: '#a0a0ff',
            fontFamily: '"Roboto", sans-serif',
            animation: 'animate__animated animate__fadeIn animate__delay-2s',
          }}
        >
          💡 Nếu bạn cần trợ giúp, liên hệ{' '}
          <a href="https://www.facebook.com/wuaan.0903?locale=vi_VN" style={{ color: '#6060ff', fontWeight: 600 }}>
            Nguyễn Minh Quân
          </a>
        </Typography> */}

        
    </Box>
    
    
  );
  
};

export default MainPage;
