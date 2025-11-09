import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Box, Grid, Card, CardContent, Avatar, Chip } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, CheckCircle, Clock, XCircle, Users, Award, Target } from "lucide-react";

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/admin/analytics");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <Container sx={{ mt: 4, textAlign: "center" }}>
      <CircularProgress />
    </Container>
  );

  if (!data) return (
    <Container sx={{ mt: 4 }}>
      <Typography>Failed to load analytics</Typography>
    </Container>
  );

  const total = data.counts.approved + data.counts.pending + data.counts.rejected;
  const approvedPercent = total > 0 ? (data.counts.approved / total) * 100 : 0;
  const pendingPercent = total > 0 ? (data.counts.pending / total) * 100 : 0;
  const rejectedPercent = total > 0 ? (data.counts.rejected / total) * 100 : 0;

  const statCards = [
    {
      title: "Approved",
      count: data.counts.approved,
      icon: CheckCircle,
      color: "#10B981",
      bgGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      status: "approved"
    },
    {
      title: "Pending",
      count: data.counts.pending,
      icon: Clock,
      color: "#F59E0B",
      bgGradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      status: "pending"
    },
    {
      title: "Rejected",
      count: data.counts.rejected,
      icon: XCircle,
      color: "#EF4444",
      bgGradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
      status: "rejected"
    },
    {
      title: "Total Students",
      count: data.totalStudents || 0,
      icon: Users,
      color: "#3B82F6",
      bgGradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
      status: null
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#1F2937',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box sx={{ p: 2, bgcolor: '#6366F1', borderRadius: 2 }}>
                <TrendingUp className="w-8 h-8 text-white" />
              </Box>
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track achievement statistics and student performance
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              {statCards.map((card, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <Card
                      onClick={() => card.status && navigate(`/admin/manage?status=${card.status}`)}
                      sx={{
                        cursor: card.status ? 'pointer' : 'default',
                        background: card.bgGradient,
                        color: 'white',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: card.status ? '0 15px 40px rgba(0,0,0,0.15)' : '0 10px 30px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                              {card.title}
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                              {card.count}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: 'rgba(255,255,255,0.2)',
                              borderRadius: 2,
                              backdropFilter: 'blur(10px)'
                            }}
                          >
                            <card.icon className="w-8 h-8" />
                          </Box>
                        </Box>
                        {card.status && total > 0 && (
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {card.status === 'approved' && `${approvedPercent.toFixed(1)}% of total`}
                            {card.status === 'pending' && `${pendingPercent.toFixed(1)}% of total`}
                            {card.status === 'rejected' && `${rejectedPercent.toFixed(1)}% of total`}
                          </Typography>
                        )}
                        {card.status && (
                          <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                            Click to view {card.title.toLowerCase()} achievements
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card sx={{ boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1F2937' }}>
                    Achievement Distribution
                  </Typography>
                  {total > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {/* Simple Pie Chart using conic-gradient */}
                      <Box
                        sx={{
                          width: 180,
                          height: 180,
                          borderRadius: '50%',
                          background: `conic-gradient(
                            #10B981 0deg ${approvedPercent * 3.6}deg,
                            #F59E0B ${approvedPercent * 3.6}deg ${(approvedPercent + pendingPercent) * 3.6}deg,
                            #EF4444 ${(approvedPercent + pendingPercent) * 3.6}deg 360deg
                          )`,
                          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                          mb: 3
                        }}
                      />
                      {/* Legend */}
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 16, height: 16, bgcolor: '#10B981', borderRadius: 0.5 }} />
                            <Typography variant="body2">Approved</Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {data.counts.approved} ({approvedPercent.toFixed(1)}%)
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 16, height: 16, bgcolor: '#F59E0B', borderRadius: 0.5 }} />
                            <Typography variant="body2">Pending</Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {data.counts.pending} ({pendingPercent.toFixed(1)}%)
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 16, height: 16, bgcolor: '#EF4444', borderRadius: 0.5 }} />
                            <Typography variant="body2">Rejected</Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {data.counts.rejected} ({rejectedPercent.toFixed(1)}%)
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                      No data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

      {/* Top Students Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
      <Paper sx={{ p: 3, mt: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ p: 1.5, bgcolor: '#FEF3C7', borderRadius: 2 }}>
            <Trophy className="w-6 h-6 text-yellow-600" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>Top Students by Points</Typography>
            <Typography variant="body2" color="text.secondary">
              Leaderboard of highest performing students
            </Typography>
          </Box>
        </Box>
        {data.topStudents && data.topStudents.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Rank</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Roll Number</strong></TableCell>
                <TableCell><strong>Section</strong></TableCell>
                <TableCell align="right"><strong>Total Points</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.topStudents.map((s, idx) => {
                const getRankBadge = (rank) => {
                  if (rank === 1) return { color: 'gold', icon: '👑' };
                  if (rank === 2) return { color: 'silver', icon: '🥈' };
                  if (rank === 3) return { color: '#CD7F32', icon: '🥉' };
                  return { color: '#3B82F6', icon: null };
                };
                const badge = getRankBadge(idx + 1);
                return (
                  <TableRow 
                    key={s._id}
                    onClick={() => navigate(`/admin/students`)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#F9FAFB' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={600} color={badge.color}>
                          {idx + 1}
                        </Typography>
                        {badge.icon && <span style={{ fontSize: '1.2rem' }}>{badge.icon}</span>}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: badge.color, width: 36, height: 36 }}>
                          {s.name?.[0]}
                        </Avatar>
                        <Typography fontWeight={500}>{s.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{s.rollNumber}</TableCell>
                    <TableCell>
                      <Chip label={s.section} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Award className="w-4 h-4 text-blue-600" />
                        <Typography color="primary" fontWeight={700} variant="h6">
                          {s.totalPoints}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            No students with points yet
          </Typography>
        )}
      </Paper>
      </motion.div>
      </Container>
    </Box>
  );
}
