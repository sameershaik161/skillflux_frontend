import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { Container, Typography, Grid, CircularProgress, Button, Box, Card, Avatar, Chip, IconButton, LinearProgress, Skeleton, Tab, Tabs } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AchievementCard from "../../components/AchievementCard";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, Award, Target, Plus, RefreshCw, Calendar, Clock, Star, ChevronRight, Zap, Medal, Activity, CheckCircle, User, FileText, Megaphone } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState({
    totalPoints: 0,
    rank: 0,
    totalAchievements: 0,
    pendingCount: 0,
    approvedCount: 0,
    monthlyGrowth: 0
  });

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/achievements/me");
      setAchievements(res.data);
      
      // Calculate stats
      const approved = res.data.filter(a => a.status === 'approved');
      const pending = res.data.filter(a => a.status === 'pending');
      const totalPoints = approved.reduce((sum, a) => sum + (a.points || 0), 0);
      
      setStats({
        totalPoints: user?.totalPoints || totalPoints,
        rank: Math.floor(Math.random() * 10) + 1, // Mock rank
        totalAchievements: res.data.length,
        pendingCount: pending.length,
        approvedCount: approved.length,
        monthlyGrowth: 12.5 // Mock growth
      });
    } catch (err) {
      console.error("Failed to fetch achievements:", err);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const getFilteredAchievements = () => {
    if (!achievements) return [];
    switch(tab) {
      case 1: return achievements.filter(a => a.status === 'approved');
      case 2: return achievements.filter(a => a.status === 'pending');
      case 3: return achievements.filter(a => a.status === 'rejected');
      default: return achievements;
    }
  };

  const statCards = [
    { 
      title: "Total Points", 
      value: stats.totalPoints, 
      icon: Trophy, 
      color: "#1E3A8A",
      growth: `+${stats.monthlyGrowth}%`
    },
    { 
      title: "Your Rank", 
      value: `#${stats.rank}`, 
      icon: Medal, 
      color: "#1E3A8A",
      subtitle: "Top 10%"
    },
    { 
      title: "Achievements", 
      value: stats.totalAchievements, 
      icon: Award, 
      color: "#1E3A8A",
      badge: stats.pendingCount > 0 ? `${stats.pendingCount} pending` : null
    },
    { 
      title: "Success Rate", 
      value: stats.totalAchievements > 0 
        ? `${Math.round((stats.approvedCount / stats.totalAchievements) * 100)}%`
        : "0%", 
      icon: Target, 
      color: "#10B981"
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Container maxWidth="xl" className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Section */}
          <Box className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: 'Inter',
                  fontWeight: 700,
                  color: '#1F2937',
                  mb: 1
                }}
              >
                Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
              </Typography>
              <Typography variant="body1" sx={{ color: '#6B7280' }}>
                Here's your achievement overview and recent activity
              </Typography>
            </Box>
            
            <Box className="flex gap-2 mt-4 md:mt-0">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <IconButton 
                  onClick={fetchAchievements} 
                  disabled={loading}
                  className="bg-white shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </IconButton>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/add")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl"
                  startIcon={<Plus className="w-5 h-5" />}
                >
                  Add Achievement
                </Button>
              </motion.div>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} className="mb-8">
            {statCards.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card 
                    elevation={0}
                    sx={{
                      p: 3,
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                      }
                    }}
                  >
                    <Box className="flex items-start justify-between mb-4">
                      <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: stat.color }}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </Box>
                      {stat.growth && (
                        <Chip 
                          label={stat.growth}
                          size="small"
                          className="bg-green-100 text-green-700 font-semibold"
                        />
                      )}
                      {stat.badge && (
                        <Chip 
                          label={stat.badge}
                          size="small"
                          className="bg-orange-100 text-orange-700 font-semibold"
                        />
                      )}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 0.5 }}>
                      {statsLoading ? <Skeleton width={80} /> : stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      {stat.title}
                    </Typography>
                    {stat.subtitle && (
                      <Typography variant="caption" className="text-gray-500">
                        {stat.subtitle}
                      </Typography>
                    )}
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Activity Section */}
          <Grid container spacing={3}>
            {/* Recent Achievements */}
            <Grid item xs={12} lg={8}>
              <Card className="p-6 shadow-xl backdrop-blur-xl bg-white/90 border-0">
                <Box className="flex items-center justify-between mb-6">
                  <Box className="flex items-center gap-3">
                    <Box sx={{ p: 1.5, backgroundColor: '#6366F1', borderRadius: '8px' }}>
                      <Trophy className="w-5 h-5 text-white" />
                    </Box>
                    <Typography variant="h6" className="font-semibold">
                      Your Achievements
                    </Typography>
                  </Box>
                  
                  <Tabs 
                    value={tab} 
                    onChange={(e, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label={`All (${achievements?.length || 0})`} />
                    <Tab label={`Approved (${stats.approvedCount})`} />
                    <Tab label={`Pending (${stats.pendingCount})`} />
                    <Tab label="Rejected" />
                  </Tabs>
                </Box>

                {loading ? (
                  <Box className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} variant="rectangular" height={120} className="rounded-xl" />
                    ))}
                  </Box>
                ) : getFilteredAchievements().length > 0 ? (
                  <Box className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    <AnimatePresence>
                      {getFilteredAchievements().map((achievement, index) => (
                        <motion.div
                          key={achievement._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className="p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-100"
                            onClick={() => navigate(`/achievement/${achievement._id}`)}
                          >
                            <Box className="flex items-start justify-between">
                              <Box className="flex gap-4">
                                <Avatar 
                                  className={`bg-gradient-to-r ${
                                    achievement.status === 'approved' 
                                      ? 'from-green-400 to-emerald-500'
                                      : achievement.status === 'pending'
                                      ? 'from-yellow-400 to-orange-500'
                                      : 'from-red-400 to-pink-500'
                                  }`}
                                >
                                  <Award className="w-5 h-5 text-white" />
                                </Avatar>
                                <Box className="flex-1">
                                  <Typography variant="subtitle1" className="font-semibold text-gray-900">
                                    {achievement.title}
                                  </Typography>
                                  <Typography variant="body2" className="text-gray-600 mb-2">
                                    {achievement.description?.substring(0, 100)}...
                                  </Typography>
                                  <Box className="flex items-center gap-2 flex-wrap">
                                    <Chip 
                                      label={achievement.status}
                                      size="small"
                                      className={`font-semibold ${
                                        achievement.status === 'approved' 
                                          ? 'bg-green-100 text-green-700'
                                          : achievement.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-red-100 text-red-700'
                                      }`}
                                    />
                                    <Chip 
                                      label={achievement.category}
                                      size="small"
                                      variant="outlined"
                                    />
                                    {achievement.points > 0 && (
                                      <Chip 
                                        label={`${achievement.points} pts`}
                                        size="small"
                                        className="bg-purple-100 text-purple-700"
                                        icon={<Zap className="w-3 h-3" />}
                                      />
                                    )}
                                    <Typography variant="caption" className="text-gray-500">
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {new Date(achievement.createdAt).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              <IconButton size="small">
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              </IconButton>
                            </Box>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </Box>
                ) : (
                  <Box className="text-center py-12">
                    <Box className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                      <Trophy className="w-12 h-12 text-gray-400" />
                    </Box>
                    <Typography variant="h6" className="text-gray-600 mb-2">
                      {tab === 0 ? "No achievements yet" : `No ${['all', 'approved', 'pending', 'rejected'][tab]} achievements`}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mb-4">
                      {tab === 0 ? "Start by adding your first achievement!" : "Check other tabs for more achievements"}
                    </Typography>
                    {tab === 0 && (
                      <Button
                        variant="contained"
                        onClick={() => navigate("/add")}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        startIcon={<Plus className="w-4 h-4" />}
                      >
                        Add Your First Achievement
                      </Button>
                    )}
                  </Box>
                )}
              </Card>
            </Grid>

            {/* Quick Actions & Activity Feed */}
            <Grid item xs={12} lg={4}>
              <Box className="space-y-4">
                {/* Quick Actions */}
                <Card className="p-6 shadow-xl backdrop-blur-xl bg-white/90 border-0">
                  <Box className="flex items-center gap-3 mb-4">
                    <Box className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Zap className="w-5 h-5 text-white" />
                    </Box>
                    <Typography variant="h6" className="font-semibold">
                      Quick Actions
                    </Typography>
                  </Box>
                  <Box className="space-y-2">
                    {[
                      { label: "Add Achievement", icon: Plus, to: "/add", color: "from-blue-600 to-purple-600" },
                      { label: "View Profile", icon: User, to: "/profile", color: "from-green-600 to-teal-600" },
                      { label: "Update ERP", icon: FileText, to: "/update-erp", color: "from-orange-600 to-red-600" },
                      { label: "Announcements", icon: Megaphone, to: "/announcements", color: "from-purple-600 to-pink-600" },
                    ].map((action, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          fullWidth
                          onClick={() => navigate(action.to)}
                          className="justify-start text-left normal-case py-3 px-4 hover:bg-gray-50 rounded-xl"
                          startIcon={
                            <Box className={`p-2 bg-gradient-to-r ${action.color} rounded-lg`}>
                              <action.icon className="w-4 h-4 text-white" />
                            </Box>
                          }
                          endIcon={<ChevronRight className="w-4 h-4 text-gray-400" />}
                        >
                          <Typography className="flex-1 font-medium text-gray-700">
                            {action.label}
                          </Typography>
                        </Button>
                      </motion.div>
                    ))}
                  </Box>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6 shadow-xl backdrop-blur-xl bg-white/90 border-0">
                  <Box className="flex items-center gap-3 mb-4">
                    <Box className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                      <Activity className="w-5 h-5 text-white" />
                    </Box>
                    <Typography variant="h6" className="font-semibold">
                      Recent Activity
                    </Typography>
                  </Box>
                  <Box className="space-y-3">
                    {[
                      { text: "Achievement approved", time: "2 hours ago", icon: CheckCircle, color: "text-green-600" },
                      { text: "Points updated", time: "5 hours ago", icon: TrendingUp, color: "text-blue-600" },
                      { text: "New announcement", time: "1 day ago", icon: Megaphone, color: "text-purple-600" },
                      { text: "Profile updated", time: "2 days ago", icon: User, color: "text-gray-600" },
                    ].map((activity, index) => (
                      <Box key={index} className="flex items-start gap-3">
                        <activity.icon className={`w-5 h-5 mt-0.5 ${activity.color}`} />
                        <Box className="flex-1">
                          <Typography variant="body2" className="text-gray-700">
                            {activity.text}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500">
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}
