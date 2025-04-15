import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  CircularProgress,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { format } from 'date-fns';

const Sidebar = ({ open, onClose, onSelectHistory }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy user_id từ localStorage
  const userDataString = localStorage.getItem('userData');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const userId = userData?.userId;

  // Hàm gọi API GET /history
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://127.0.0.1:5000/history', {
        params: { user_id: userId },
      });
      setHistory(response.data);
    } catch (err) {
      console.error('Lỗi khi gọi API lịch sử:', err);
      setError('Không thể tải lịch sử tóm tắt.');
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi Sidebar mở và có userId
  useEffect(() => {
    if (open && userId) {
      fetchHistory();
    } else {
      setHistory([]);
      setError(null);
    }
  }, [open, userId]);

  // Hàm xóa lịch sử
  const handleDeleteHistory = async (historyId) => {
    // Hiển thị hộp thoại xác nhận
    const confirmDelete = window.confirm('Bạn có chắc muốn xóa lịch sử này không?');
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await axios.delete(`http://127.0.0.1:5000/history/${historyId}`);
      await fetchHistory(); // Refresh danh sách
    } catch (err) {
      console.error('Lỗi khi xóa lịch sử:', err);
      setError('Không thể xóa lịch sử.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 300,
          background: 'linear-gradient(145deg, #2e2e2e, #3e3e3e)',
          color: 'white',
          borderRight: '1px solid rgba(160, 160, 255, 0.3)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: '#a0a0ff',
            fontWeight: 600,
            mb: 2,
            textAlign: 'center',
            fontFamily: '"Roboto", sans-serif',
          }}
        >
          Lịch sử tóm tắt
        </Typography>
        <Divider sx={{ bgcolor: 'rgba(160, 160, 255, 0.3)', mb: 2 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} sx={{ color: '#a0a0ff' }} />
          </Box>
        ) : error ? (
          <Typography sx={{ color: '#ff8080', textAlign: 'center' }}>
            {error}
          </Typography>
        ) : !userId ? (
          <Typography
            sx={{ color: '#ccc', textAlign: 'center', fontStyle: 'italic' }}
          >
            Vui lòng đăng nhập để xem lịch sử
          </Typography>
        ) : history.length === 0 ? (
          <Typography
            sx={{ color: '#ccc', textAlign: 'center', fontStyle: 'italic' }}
          >
            Chưa có lịch sử tóm tắt
          </Typography>
        ) : (
          <List>
            {history.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  borderRadius: '10px',
                  mb: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  position: 'relative',
                  '&:hover': {
                    bgcolor: 'rgba(160, 160, 255, 0.1)',
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s ease',
                    '& .delete-icon': {
                      opacity: 1,
                    },
                  },
                }}
                onClick={() => {
                  onSelectHistory(item); // Gọi callback để bind dữ liệu
                  onClose(); // Đóng Sidebar
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        color: '#a0a0ff',
                        fontSize: 14,
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        pr: 4,
                      }}
                    >
                      {item.summary.length > 50
                        ? item.summary.substring(0, 50) + '...'
                        : item.summary}
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ color: '#ccc', fontSize: 12 }}>
                      {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')}
                    </Typography>
                  }
                />
                <IconButton
                  className="delete-icon"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHistory(item.id);
                  }}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#ff8080',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 128, 128, 0.2)',
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;