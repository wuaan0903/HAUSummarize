import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Header = ({ onOpenSidebar }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // TODO: Xử lý logout
    handleClose();
  };

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: '#1e1e1e',
        color: 'white',
        boxShadow: 'none',
        borderBottom: '1px solid #444',
        width: '100%',
        maxWidth: 'none',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: 'none',
          px: 2,
        }}
      >
        <IconButton
          edge="start"
          color="inherit" // Đặt trực tiếp làm prop
          onClick={onOpenSidebar}
          aria-label="menu"
        >
          <MenuIcon />
        </IconButton>

        


        <Box>
          <IconButton onClick={handleMenuOpen}>
            <Avatar alt="User" src="https://picsum.photos/200" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                bgcolor: '#1e1e1e',
                color: 'white',
              },
            }}
          >
            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;