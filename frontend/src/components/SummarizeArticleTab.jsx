import React from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Delete from "@mui/icons-material/Delete";

const SummarizeArticleTab = ({
  inputText,
  setInputText,
  summaryResult,
  setSummaryResult,
  extractedText,
  handleSummarizePost,
  loading,
}) => {
  return (
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

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
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
          <Typography variant="body2" sx={{ whiteSpace: "pre-line", mt: 1 }}>
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
              <Typography>Copy đường link bài viết bạn muốn tóm tắt</Typography>
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
              <Typography>Dán đường link vào ô input phía trên</Typography>
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
          <Typography variant="body1" sx={{ whiteSpace: "pre-line", mt: 1 }}>
            {summaryResult}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SummarizeArticleTab;