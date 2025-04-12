// Intro.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';
import 'animate.css';

const Intro = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        bgcolor: 'black',
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: 'radial-gradient(circle at right, #ffebc2 10%, #000 70%)',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="md">
        <div className="animate__animated animate__fadeIn animate__slow">
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '3rem', sm: '5rem', md: '5rem' },
              background: 'linear-gradient(90deg, #fff, #ccc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: 2,
            }}
          >
            NCKH
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mt: 2,
              color: 'rgba(255,255,255,0.8)',
              fontSize: { xs: '1rem', md: '1.3rem' },
              maxWidth: '800px',
              mx: 'auto',
            }}
            className="animate__animated animate__fadeIn animate__delay-0.5s animate__slow"
          >
            Ứng dụng hỗ trợ xử lý và phân tích dữ liệu đầu vào một cách hiệu quả và thông minh.
          </Typography>

          <div className="animate__animated animate__fadeIn animate__delay-1s animate__slow">
            <Button
              variant="outlined"
              onClick={() => navigate('/main')}
              sx={{
                mt: 4,
                color: 'white',
                borderColor: 'white',
                borderRadius: '30px',
                px: 5,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1.5rem',
                transition: 'all 0.4s ease',
                '&:hover': {
                  backgroundColor: 'white',
                  color: 'black',
                },
              }}
            >
              Bắt đầu
            </Button>
          </div>
        </div>
      </Container>
    </Box>
  );
};

export default Intro;
