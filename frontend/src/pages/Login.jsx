import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  InputAdornment,
  Link as MuiLink,
  Snackbar,
  Alert,
} from '@mui/material';
import { Person, Lock } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'animate.css';
import Logo from '../img/58cc8d39-8cc4-486d-b0de-93e451229f62.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: '', password: '' };

    if (!username) {
      newErrors.username = 'Vui lòng nhập tên tài khoản!';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu!';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự!';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessOpen(false);
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Gọi API đăng nhập
      const response = await axios.post('http://127.0.0.1:5000/login', {
        username,
        password,
      });

      console.log('API response:', response);

      // Kiểm tra mã status
      if (response.status !== 200) {
        throw new Error('Phản hồi từ API không thành công!');
      }

      // Kiểm tra dữ liệu trả về
      const { access_token, userId, username: responseUsername } = response.data;
      if (!access_token || !userId || !responseUsername) {
        throw new Error('Dữ liệu trả về không đầy đủ!');
      }

      // Lưu userData vào localStorage
      try {
        const userData = { access_token, userId, username: responseUsername };
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('userData saved:', userData);
      } catch (storageError) {
        console.error('Storage error:', storageError);
        throw new Error('Không thể lưu dữ liệu đăng nhập!');
      }

      // Hiển thị thông báo thành công
      setSuccessOpen(true);

      // Chuyển hướng sau khi thông báo hiển thị
      setTimeout(() => {
        console.log('Navigating to /');
        navigate('/main');
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        setApiError(err.response.data?.error || 'Đăng nhập thất bại! Vui lòng thử lại.');
      } else {
        setApiError(err.message || 'Đã có lỗi xảy ra! Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessOpen(false);
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #1e1e1e 30%, #2a2a3a 90%)',
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
        {/* Logo và tiêu đề */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
          <img src={Logo} alt="Logo" style={{ width: 40, height: 40, marginRight: 8 }} />
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Orbitron", sans-serif',
              letterSpacing: '2px',
              background: 'linear-gradient(90deg, #ffffff, #a0a0ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            HAUSummarize
          </Typography>
        </Box>

        {/* Thông báo lỗi từ API */}
        {apiError && (
          <Typography color="error" sx={{ textAlign: 'center', mb: 2 }}>
            {apiError}
          </Typography>
        )}

        {/* Form Đăng Nhập */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              sx: {
                color: '#a0a0ff',
                fontFamily: '"Roboto", sans-serif',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: '#a0a0ff' }} />
                </InputAdornment>
              ),
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            InputLabelProps={{
              sx: {
                color: '#a0a0ff',
                fontFamily: '"Roboto", sans-serif',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#a0a0ff' }} />
                </InputAdornment>
              ),
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

          {/* Link Quên mật khẩu */}
          <MuiLink
            component={Link}
            to="/forgot-password"
            sx={{
              textAlign: 'right',
              color: '#a0a0ff',
              fontSize: 14,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Quên mật khẩu?
          </MuiLink>

          {/* Nút Đăng Nhập */}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
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
              '&:disabled': {
                background: 'rgba(160, 160, 255, 0.5)',
                cursor: 'not-allowed',
              },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Đăng Nhập'}
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
            <MuiLink
              component={Link}
              to="/register"
              sx={{ color: '#6060ff', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Đăng ký ngay
            </MuiLink>
          </Typography>
        </Box>
      </Paper>

      {/* Thông báo thành công */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ animation: 'animate__animated animate__bounceInDown' }}
      >
        <Alert
          severity="success"
          sx={{
            background: 'linear-gradient(145deg, #2e2e2e, #3e3e3e)',
            color: '#a0a0ff',
            border: '1px solid rgba(160, 160, 255, 0.5)',
            boxShadow: '0 0 15px rgba(160, 160, 255, 0.3)',
            fontFamily: '"Roboto", sans-serif',
            fontWeight: 600,
            '& .MuiAlert-icon': { color: '#a0a0ff' },
          }}
        >
          Đăng nhập thành công! Chào mừng {username}!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;