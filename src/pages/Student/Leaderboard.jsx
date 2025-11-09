import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { Container, Typography, Box, Card, Avatar, Chip, CircularProgress, Grid, IconButton, Paper, Table, TableHead, TableRow, TableCell, TableBody, CardContent } from "@mui/material";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp, Users, RefreshCw, Crown, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getFileUrl } from "../../config/api";

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const [leaderboardRes, rankRes] = await Promise.all([
        axios.get("/auth/leaderboard"),
        axios.get("/auth/my-rank")
      ]);
      console.log("Leaderboard data:", leaderboardRes.data);
      console.log("Rank data:", rankRes.data);
      setLeaderboard(leaderboardRes.data || []);
      setMyRank(rankRes.data);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank) => {
    if (rank === 1) return { color: "gold", icon: <Crown className="w-4 h-4" /> };
    if (rank === 2) return { color: "silver", icon: <Medal className="w-4 h-4" /> };
    if (rank === 3) return { color: "#CD7F32", icon: <Medal className="w-4 h-4" /> };
    return { color: "#3B82F6", icon: null };
  };

  if (loading) {
    return (
      <Box className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Container maxWidth="lg" className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Box className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: 'Inter',
                  fontWeight: 700,
                  color: '#1F2937',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                  <Trophy className="w-8 h-8 text-white" />
                </Box>
                Leaderboard
              </Typography>
              <Typography variant="body1" sx={{ color: '#6B7280' }}>
                Top performing students ranked by total points
              </Typography>
            </Box>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton 
                onClick={fetchLeaderboard} 
                disabled={loading}
                className="bg-white shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </IconButton>
            </motion.div>
          </Box>

          {/* My Rank Card */}
          {myRank && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <Box className="text-center">
                      <Typography variant="h2" className="font-bold mb-1">
                        #{myRank.rank}
                      </Typography>
                      <Typography variant="body2">Your Rank</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box className="text-center">
                      <Typography variant="h4" className="font-bold mb-1">
                        {myRank.totalPoints}
                      </Typography>
                      <Typography variant="body2">Total Points</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box className="text-center">
                      <Typography variant="h4" className="font-bold mb-1">
                        Top {myRank.percentile}%
                      </Typography>
                      <Typography variant="body2">Percentile</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box className="text-center">
                      <Typography variant="h4" className="font-bold mb-1">
                        {myRank.totalStudents}
                      </Typography>
                      <Typography variant="body2">Total Students</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </motion.div>
          )}

          {/* Leaderboard Table - Matching Admin Analytics Design */}
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Top Students by Points
            </Typography>
            {leaderboard && leaderboard.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Rank</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Roll Number</strong></TableCell>
                    <TableCell><strong>Year</strong></TableCell>
                    <TableCell><strong>Section</strong></TableCell>
                    <TableCell align="right"><strong>Total Points</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((student, idx) => {
                    const badge = getRankBadge(idx + 1);
                    const isYou = student._id === user?.id;
                    return (
                      <TableRow 
                        key={student._id}
                        sx={{ 
                          backgroundColor: isYou ? '#EFF6FF' : 'inherit',
                          '&:hover': { backgroundColor: '#F9FAFB' }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontWeight={600} color={badge.color}>
                              {idx + 1}
                            </Typography>
                            {badge.icon}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              src={student.profilePicUrl ? getFileUrl(student.profilePicUrl) : undefined}
                              sx={{ width: 40, height: 40 }}
                            >
                              {student.name?.[0]}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={isYou ? 700 : 500}>
                                {student.name}
                                {isYou && (
                                  <Chip 
                                    label="You" 
                                    size="small" 
                                    sx={{ ml: 1, bgcolor: '#3B82F6', color: 'white', fontWeight: 600 }}
                                  />
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`Year ${student.year}`} 
                            size="small"
                            sx={{ bgcolor: '#E0E7FF', color: '#4338CA', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>{student.section}</TableCell>
                        <TableCell align="right">
                          <Typography color="primary" fontWeight={700} variant="h6">
                            {student.totalPoints || 0}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                No students with points yet
              </Typography>
            )}
          </Paper>

          {leaderboard.length === 0 && (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <Typography variant="h6" className="text-gray-600 mb-2">
                No students yet
              </Typography>
              <Typography variant="body2" className="text-gray-500">
                Be the first to earn points!
              </Typography>
            </Card>
          )}
        </motion.div>
      </Container>
    </Box>
  );
}
