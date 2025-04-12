import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import 'animate.css';

const Login = () => {
  return (
    <Box
      sx={{
        // Gradient background giống MainPage
        background: 'linear-gradient(135deg, #1e1e1e 30%, #2a2a3a 90%)',
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        // Hiệu ứng glow nền
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
      }}
    >
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          background: 'linear-gradient(145deg, #2e2e2e, #3e3e3e)',
          borderRadius: '20px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(160, 160, 255, 0.2)',
          animation: 'animate__animated animate__fadeInUp animate__slow',
          transition: 'transform 0.3s ease',
          maxWidth: '450px',
          width: '100%',
          zIndex: 1,
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(160, 160, 255, 0.3)',
          },
        }}
      >
        {/* Tiêu đề */}
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            mb: 4,
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '2px',
            background: 'linear-gradient(90deg, #ffffff, #a0a0ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Đăng Nhập
        </Typography>

        {/* Form Đăng Nhập */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Email"
            placeholder="Nhập email của bạn"
            InputLabelProps={{
              sx: {
                color: '#a0a0ff',
                fontFamily: '"Roboto", sans-serif',
              },
            }}
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
            sx={{
              '&:hover .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          />

          <TextField
            fullWidth
            variant="outlined"
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu"
            InputLabelProps={{
              sx: {
                color: '#a0a0ff',
                fontFamily: '"Roboto", sans-serif',
              },
            }}
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
            sx={{
              '&:hover .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          />

          {/* Nút Đăng Nhập */}
          <Button
            variant="contained"
            sx={{
              color: 'white',
              background: 'linear-gradient(90deg, #a0a0ff, #6060ff)',
              fontWeight: 600,
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
            Đăng Nhập
          </Button>

          {/* Link đến Đăng Ký */}
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: '#a0a0ff',
              fontFamily: '"Roboto", sans-serif',
              mt: 2,
            }}
          >
            Chưa có tài khoản?{' '}
            <a href="/register" style={{ color: '#6060ff', fontWeight: 600 }}>
              Đăng ký ngay
            </a>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;