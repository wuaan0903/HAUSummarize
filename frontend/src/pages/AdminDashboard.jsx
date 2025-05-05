import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Paper,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Users, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import SearchIcon from '@mui/icons-material/Search';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const AdminDashboard = () => {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [coinAmount, setCoinAmount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [stats, setStats] = useState(null);
  const [summaryStats, setSummaryStats] = useState([]);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [historyUser, setHistoryUser] = useState(null);
  const [transactions, setTransactions] = useState([]); // Danh sách giao dịch
  const [searchTerm, setSearchTerm] = useState('');

  const [filteredUsers, setFilteredUsers] = useState([]); // State lưu danh sách người dùng
  const [loading, setLoading] = useState(true); // State kiểm tra loading

  const [amount, setAmount] = useState();
  const [message, setMessage] = useState('');
  const [rechargeTransactions, setRechargeTransactions] = useState([]);
  useEffect(() => {
    setUsers([
      { id: 1, name: "Nguyen Van A", email: "a@example.com", coin: 10 },
      { id: 2, name: "Tran Thi B", email: "b@example.com", coin: 5 },
      { id: 3, name: "Le Van C", email: "c@example.com", coin: 20 },
      { id: 4, name: "Pham Thi D", email: "d@gmail.com", coin: 15 },
      { id: 5, name: "Nguyen Van E", email: "e@gmail.com", coin: 8 },
    ]);

    

    fetchUsers(); // Gọi API khi component được mount

    const fetchStatistics = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/statistics');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Lỗi khi tải thống kê:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();

    fetch('http://localhost:5000/api/summary-stats-7days')
      .then(res => res.json())
      .then(json => setSummaryStats(json.data))
      .catch(err => console.error("Lỗi tải dữ liệu thống kê 7 ngày:", err));
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users"); // Đảm bảo API của bạn có endpoint này
      setFilteredUsers(response.data.users); // Cập nhật filteredUsers với dữ liệu từ API
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu người dùng:", error);
    } finally {
      setLoading(false); // Đổi trạng thái loading sau khi hoàn thành gọi API
    }
  };

  const handleTabChange = (_, newValue) => setTab(newValue);

  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setCoinAmount(0);
    setOpenDialog(true);
  };

  const handleAddCoins = () => {
    alert(`Đã nạp ${coinAmount} xu cho ${selectedUser.name}`);
    setOpenDialog(false);
  };

  const handleViewHistory = async (user) => {
    setHistoryUser(user);
  
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}/transactions`);
      const data = await res.json();
      setTransactions(data.transactions);
      setOpenHistoryDialog(true);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử giao dịch:", error);
    }
  };
  


  const handleRecharge = async () => {
    if (!selectedUser?.id) {
      setMessage("Không xác định được tài khoản.");
      return;
    }
  
    const parsedAmount = parseInt(coinAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessage("Số xu phải là số nguyên dương.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/users/${selectedUser.id}/recharge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseInt(coinAmount) }), // Chuyển đổi amount thành số nguyên
      });

      const data = await res.json();
      
      if (res.ok) {
        fetchUsers(); // Cập nhật danh sách người dùng sau khi nạp xu thành công
        setMessage(`✅ Nạp thành công ${parsedAmount} xu cho người dùng ${selectedUser.username}.`);
        setOpenDialog(false); // đóng dialog
        setCoinAmount(0); // reset input (nếu cần)
      } else {
        setMessage(data?.message || '❌ Nạp xu thất bại.');
      }
    } catch (err) {
      setMessage('❌ Lỗi kết nối server.');
    }
  };

  const fetchRecharges = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/transactions/recharges");
      const data = await res.json();
      setRechargeTransactions(data.transactions);
    } catch (err) {
      console.error("Lỗi khi lấy giao dịch nạp xu:", err);
    }
  };

  fetchRecharges();

  const coinHistory = [
    { userName: "Nguyễn Văn A", amount: 100, date: "2025-04-29T14:23:00Z" },
    { userName: "Trần Thị B", amount: 50, date: "2025-04-29T10:10:00Z" },
    { userName: "Lê Văn C", amount: 200, date: "2025-04-28T16:45:00Z" },
    { userName: "Phạm Thị D", amount: 150, date: "2025-04-27T12:30:00Z" },
    { userName: "Nguyễn Văn E", amount: 75, date: "2025-04-26T09:15:00Z" },
    // ...
  ];
  

  return (
    <Box sx={{
      background: "linear-gradient(135deg, #1a1a2e 30%, #2e2e4a 90%)",
    }} p={4} bgcolor="#f5f7fa" minHeight="100vh">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Paper elevation={3} sx={{ mb: 4, borderRadius: 3 }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"

            sx={{
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
            <Tab icon={<Users size={20} />} label="Quản lý tài khoản" />
            <Tab icon={<BarChart2 size={20} />} label="Thống kê" />
          </Tabs>
        </Paper>
      </motion.div>

      {tab === 0 && (
        <Card
  sx={{
    borderRadius: 4,
    boxShadow: 6,
    background: '#1e1e2f',
    color: 'white',
    overflow: 'hidden',
    mb: 4,
  }}
>
<CardHeader
  title={
    <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
      👥 Danh sách người dùng
    </Typography>
  }
  action={
    <TextField
      variant="outlined"
      size="small"
      placeholder="🔍 Tìm theo tên hoặc email"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      sx={{
        width: 280,
        backgroundColor: '#2e2e45',
        input: { color: '#fff' },
        fieldset: { borderColor: '#555' },
        '& .MuiOutlinedInput-root:hover fieldset': {
          borderColor: '#888',
        },
        '& .MuiOutlinedInput-root.Mui-focused fieldset': {
          borderColor: '#1976d2',
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: '#aaa' }} />
          </InputAdornment>
        ),
      }}
    />
  }
  sx={{
    background: "linear-gradient(145deg, #292943, #3a3a56)",
    borderBottom: "1px solid #444",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    py: 2,
    px: 3,
  }}
/>

  <CardContent sx={{ padding: 0 }}>

    <Table>
      <TableHead>
        <TableRow sx={{ background: "#2e2e45" }}>
          {["ID", "Tên tài khoản", "Email", "Số xu", "Thao tác", "Lịch sử giao dịch"].map((head, i) => (
            <TableCell
              key={i}
              sx={{
                color: "#cfd8dc",
                fontWeight: "bold",
                fontSize: 13,
                textTransform: "uppercase",
                borderBottom: "1px solid #444",
              }}
            >
              {head}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
      {filteredUsers.map((user) => (
          <TableRow
            key={user.id}
            hover
            sx={{
              "&:hover": {
                backgroundColor: "#2a2a3f",
              },
              transition: "all 0.2s ease",
            }}
          >
            {[user.id, user.username, user.email, user.coin].map((value, idx) => (
              <TableCell
                key={idx}
                sx={{
                  color: "#e0e0e0",
                  fontFamily: '"Roboto", sans-serif',
                  fontSize: 14,
                  fontWeight: 500,
                  borderBottom: "1px solid #39395a",
                }}
              >
                {value}
              </TableCell>
            ))}
            <TableCell sx={{ borderBottom: "1px solid #39395a" }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleOpenDialog(user)}
                sx={{
                  background: "linear-gradient(90deg, #7e57c2, #9575cd)",
                  fontWeight: 600,
                  borderRadius: "20px",
                  color: "white",
                  px: 3,
                  py: 1,
                  boxShadow: "0 2px 10px rgba(126, 87, 194, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #9575cd, #7e57c2)",
                    transform: "scale(1.05)",
                  },
                }}
              >
                Nạp xu
              </Button>
            </TableCell>
            <TableCell sx={{ borderBottom: "1px solid #39395a" }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleViewHistory(user)}
                sx={{
                  background: "linear-gradient(90deg, #26c6da, #00acc1)",
                  fontWeight: 600,
                  borderRadius: "20px",
                  color: "white",
                  px: 3,
                  py: 1,
                  boxShadow: "0 2px 10px rgba(38, 198, 218, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #00acc1, #26c6da)",
                    transform: "scale(1.05)",
                  },
                }}
              >
                Xem
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>

      )}

      {tab === 1 && (
        <>
        <Grid container spacing={3} mb={3} justifyContent="center">
          <Grid item xs={12} sm={4} width={"31%"}>
            <Card
              sx={{
                borderRadius: 4,
                background: "linear-gradient(135deg, #1e1e2f, #2e2e40)",
                color: "white",
                height: '100%',
                boxShadow: "0 4px 20px rgba(160, 160, 255, 0.15)",
                p: 2,
                transition: "all 0.3s ease",
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 6px 30px rgba(160, 160, 255, 0.25)'
                }
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" fontWeight={500} gutterBottom sx={{ opacity: 0.8 }}>
                  👥 Tổng người dùng
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.total_users}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} width={"31%"}>
            <Card
              sx={{
                borderRadius: 4,
                background: "linear-gradient(135deg, #1b2a3a, #27485a)",
                color: "white",
                height: '100%',
                boxShadow: "0 4px 20px rgba(96, 181, 255, 0.15)",
                p: 2,
                transition: "all 0.3s ease",
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 6px 30px rgba(96, 181, 255, 0.25)'
                }
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" fontWeight={500} gutterBottom sx={{ opacity: 0.8 }}>
                  📄 Lượt tóm tắt hôm nay
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.summaries_today}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} width={"31%"}>
            <Card
              sx={{
                borderRadius: 4,
                background: "linear-gradient(135deg, #3a2a1e, #5a3f27)",
                color: "white",
                height: '100%',
                boxShadow: "0 4px 20px rgba(255, 200, 100, 0.15)",
                p: 2,
                transition: "all 0.3s ease",
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 6px 30px rgba(255, 200, 100, 0.25)'
                }
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" fontWeight={500} gutterBottom sx={{ opacity: 0.8 }}>
                  💵 Tổng thu nhập
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.total_income_vnd.toLocaleString()} đ
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} 
          sx={{
            width: "70%",
          }}
          >
            {/* Danh sách người dùng nạp xu gần đây */}
            {/* Biểu đồ thống kê */}
            <Card
  sx={{
    borderRadius: 4,
    background: "linear-gradient(145deg, #2e2e45, #3a3a56)",
    color: "white",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  }}
>
  <CardHeader
    title={
      <Typography variant="h6" fontWeight="bold" sx={{ color: "white" }}>
        📊 Thống kê lượt tóm tắt 7 ngày gần nhất
      </Typography>
    }
    sx={{
      borderBottom: "1px solid #444",
      py: 2,
      px: 3,
      background: "linear-gradient(90deg, #3a3a56, #2e2e45)",
    }}
  />
  <CardContent sx={{ px: 3,maxHeight: 500 }}>
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={summaryStats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" stroke="#bbb" />
        <YAxis stroke="#bbb" />
        <Tooltip
          contentStyle={{ backgroundColor: "#42425c", borderRadius: 8, border: "none" }}
          labelStyle={{ color: "#fff" }}
          itemStyle={{ color: "#fff" }}
        />
        <Bar dataKey="count" fill="#9575cd" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>


          </Grid>
          <Grid item xs={12} md={6} 
          sx={{
            width: "27%",
          }}>
            {/* Lịch sử nạp xu */}
            <Card
  sx={{
    borderRadius: 4,
    background: "linear-gradient(145deg, #2e2e45, #3a3a56)",
    color: "white",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  }}
>
  <CardHeader
    title={
      <Typography variant="h6" fontWeight="bold" sx={{ color: "white" }}>
        💰 Lịch sử nạp xu gần đây
      </Typography>
    }
    sx={{
      borderBottom: "1px solid #444",
      py: 2,
      px: 3,
      background: "linear-gradient(90deg, #3a3a56, #2e2e45)",
    }}
  />
  <CardContent sx={{ maxHeight: 500, overflowY: "auto", px: 3 }}>
    <List dense>
    {rechargeTransactions.map((entry,index) => (
        <ListItem
          key={index}
          sx={{
            
            mb: 1,
            backgroundColor: "#39395a",
            borderRadius: 2,
            px: 2,
            py: 1,
            color: "#fff",
            boxShadow: "inset 0 0 5px rgba(255,255,255,0.05)",
          }}
        >
          <ListItemText
            primary={
              <Typography variant="body2" fontWeight="bold" color="#e0e0e0">
                {entry.name} nạp {entry.amount} xu
              </Typography>
            }
            secondary={
              <Typography variant="caption" color="#b0bec5">
                {new Date(entry.timestamp).toLocaleString()}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  </CardContent>
</Card>


          </Grid>
        </Grid>


        </>
      )}

<Dialog 
  open={openDialog} 
  onClose={() => setOpenDialog(false)} 
  maxWidth="xs" 
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 4,
      background: "linear-gradient(135deg, #1f1f2e, #2e2e40)",
      color: "white",
      boxShadow: "0px 0px 20px rgba(160,160,255,0.2)"
    }
  }}
>
  <DialogTitle 
    sx={{ 
      fontWeight: 'bold', 
      fontSize: '1.5rem', 
      background: "linear-gradient(145deg, #25253a, #35354a)", 
      color: "white", 
      borderTopLeftRadius: 16, 
      borderTopRightRadius: 16,
      px: 3, 
      py: 2 
    }}
  >
    💰 Nạp xu cho người dùng
  </DialogTitle>

  <DialogContent sx={{ px: 3, py: 2 }}>
    <Typography gutterBottom sx={{ mb: 2 }}>
      Người dùng: <strong style={{ color: '#a0a0ff' }}>{selectedUser?.username}</strong>
    </Typography>
    <TextField
      fullWidth
      type="number"
      value={coinAmount}
      placeholder="Nhập số xu cần nạp"
      label="Số xu cần nạp"
      variant="outlined"
      onChange={(e) => setCoinAmount(Number(e.target.value))}
      InputProps={{
        sx: {
          color: "white",
          backgroundColor: "#2c2c3e",
          borderRadius: 2,
          '& input': { fontWeight: 600 }
        }
      }}
      InputLabelProps={{
        sx: { color: '#aaa' }
      }}
    />
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2 }}>
    <Button 
      onClick={() => setOpenDialog(false)} 
      sx={{
        background: "#555",
        color: "white",
        borderRadius: 3,
        fontWeight: 600,
        px: 3,
        "&:hover": {
          background: "#777",
        }
      }}
    >
      Hủy
    </Button>
    <Button 
      onClick={() => handleRecharge(coinAmount)}
      variant="contained"
      sx={{
        background: "linear-gradient(90deg, #a0a0ff, #6060ff)",
        color: "white",
        borderRadius: 3,
        fontWeight: 600,
        px: 3,
        boxShadow: "0 0 15px rgba(160, 160, 255, 0.5)",
        transition: "all 0.3s ease",
        "&:hover": {
          background: "linear-gradient(90deg, #6060ff, #a0a0ff)",
          transform: "scale(1.02)",
          boxShadow: "0 0 15px rgba(160, 160, 255, 0.7)",
        }
      }}
    >
      Xác nhận
    </Button>
  </DialogActions>
</Dialog>


<Dialog 
  open={openHistoryDialog} 
  onClose={() => setOpenHistoryDialog(false)} 
  maxWidth="md" 
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 4,
      background: "linear-gradient(135deg, #1f1f2e, #2e2e40)",
      color: "white",
      boxShadow: "0px 0px 25px rgba(160,160,255,0.2)"
    }
  }}
>
  <DialogTitle 
    sx={{ 
      fontWeight: 'bold', 
      fontSize: '1.5rem', 
      background: "linear-gradient(145deg, #25253a, #35354a)", 
      color: "white", 
      borderTopLeftRadius: 16, 
      borderTopRightRadius: 16,
      px: 3, 
      py: 2 
    }}
  >
    📜 Lịch sử giao dịch - {historyUser?.username}
  </DialogTitle>

  <DialogContent dividers sx={{ px: 3, py: 2 }}>
    {transactions.length > 0 ? (
      <Table size="small" sx={{ backgroundColor: 'transparent' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#a0a0ff', fontWeight: 'bold' }}>Ngày</TableCell>
            <TableCell sx={{ color: '#a0a0ff', fontWeight: 'bold' }}>Số xu</TableCell>
            <TableCell sx={{ color: '#a0a0ff', fontWeight: 'bold' }}>Ghi chú</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((txn) => (
            <TableRow key={txn.id} hover>
              <TableCell sx={{ color: "#fff" }}>{txn.timestamp}</TableCell>
              <TableCell sx={{ color: txn.amount > 0 ? '#6effa0' : '#ff7676', fontWeight: 'bold' }}>
                {txn.amount > 0 ? `+${txn.amount}` : txn.amount}
              </TableCell>
              <TableCell sx={{ color: "#ccc" }}>
                {txn.type === 'recharge' ? 'Nạp ' +txn.amount + ' xu ' : 
                txn.type === 'summarize_article' ? 'Tóm tắt bài viết' :
                txn.type === 'summarize_youtube' ? 'Tóm tắt video' :
                txn.type === 'summarize' ? 'Tóm tắt văn bản' : 'Khác'}
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : (
      <Typography sx={{ color: '#aaa' }}>Không có giao dịch nào.</Typography>
    )}
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2 }}>
    <Button 
      onClick={() => setOpenHistoryDialog(false)} 
      variant="contained"
      sx={{
        background: "linear-gradient(90deg, #a0a0ff, #6060ff)",
        borderRadius: "25px",
        fontWeight: "bold",
        boxShadow: "0 0 15px rgba(160, 160, 255, 0.5)",
        transition: "all 0.3s ease",
        "&:hover": {
          background: "linear-gradient(90deg, #6060ff, #a0a0ff)",
          transform: "scale(1.02)",
          boxShadow: "0 0 15px rgba(160, 160, 255, 0.7)",
        }
      }}
    >
      Đóng
    </Button>
  </DialogActions>
</Dialog>


<Snackbar
  open={Boolean(message)}
  autoHideDuration={4000}
  onClose={() => setMessage("")}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert 
    onClose={() => setMessage("")} 
    severity={message.startsWith("✅") ? "success" : "error"} 
    sx={{
      background: "linear-gradient(145deg, #2a2a3a, #3a3a4a)",
      color: "#a0a0ff",
      border: "1px solid rgba(160, 160, 255, 0.5)",
      boxShadow: "0 0 15px rgba(160, 160, 255, 0.3)",
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 600,
      "& .MuiAlert-icon": { color: "#a0a0ff" },
    }}
  >
    {message}
  </Alert>
</Snackbar>



    </Box>

    
  );
};

export default AdminDashboard;
