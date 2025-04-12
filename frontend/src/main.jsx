import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme'; // nếu có

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Reset mặc định */}
      <AppRoutes />
    </ThemeProvider>
  </React.StrictMode>
);