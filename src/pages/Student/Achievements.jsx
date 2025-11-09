import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { Container, Typography, Box, Card, Avatar, Chip, CircularProgress, Grid, IconButton, Tab, Tabs, Divider } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, Calendar, Clock, Zap, ChevronRight, ArrowLeft, Music, Dumbbell, BookOpen, Star, Medal, Target, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Achievements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Achievements', icon: Trophy, color: '#6366F1' },
    { value: 'Academic Certifications', label: 'Academic', icon: BookOpen, color: '#3B82F6' },
    { value: 'Cultural Events', label: 'Cultural', icon: Music, color: '#A855F7' },
    { value: 'Sports', label: 'Sports', icon: Dumbbell, color: '#10B981' },
    { value: 'Technical Events', label: 'Technical', icon: Star, color: '#F59E0B' },
  ];

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/achievements/me");
      setAchievements(res.data);
    } catch (err) {
      console.error("Failed to fetch achievements:", err);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') return achievements;
    return achievements.filter(a => a.category === selectedCategory);
  };

  const getCategoryStats = (category) => {
    if (category === 'all') return achievements.length;
    return achievements.filter(a => a.category === category).length;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
      case 'rejected': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
    }
  };

  const filteredAchievements = getFilteredAchievements();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Container maxWidth="xl" className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Box className="mb-8">
            <Box className="flex items-center gap-4 mb-4">
              <IconButton 
                onClick={() => navigate('/dashboard')}
                className="bg-white shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </IconButton>
              <Box className="flex-1">
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    color: '#1F2937',
                    mb: 0.5
                  }}
                >
                  My Achievements
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  View all your achievements organized by category
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Category Cards */}
          <Grid container spacing={3} className="mb-8">
            {categories.map((category, index) => {
              const CategoryIcon = category.icon;
              const count = getCategoryStats(category.value);
              const isSelected = selectedCategory === category.value;
              
              return (
                <Grid item xs={12} sm={6} md={2.4} key={category.value}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card
                      onClick={() => setSelectedCategory(category.value)}
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        backgroundColor: isSelected ? category.color : 'white',
                        border: isSelected ? 'none' : '1px solid #E5E7EB',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                          transform: 'translateY(-4px)'
                        }
                      }}
                    >
                      <Box className="text-center">
                        <Box 
                          sx={{ 
                            display: 'inline-flex',
                            p: 1.5, 
                            borderRadius: '12px', 
                            backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : category.color,
                            mb: 2
                          }}
                        >
                          <CategoryIcon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-white'}`} />
                        </Box>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 700, 
                            color: isSelected ? 'white' : '#1F2937',
                            mb: 0.5
                          }}
                        >
                          {count}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: isSelected ? 'rgba(255, 255, 255, 0.9)' : '#6B7280',
                            fontWeight: isSelected ? 600 : 400
                          }}
                        >
                          {category.label}
                        </Typography>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          {/* Achievements List */}
          <Card className="p-6 shadow-xl">
            <Box className="flex items-center justify-between mb-6">
              <Box className="flex items-center gap-3">
                <Box sx={{ p: 1.5, backgroundColor: '#6366F1', borderRadius: '8px' }}>
                  <Trophy className="w-5 h-5 text-white" />
                </Box>
                <Typography variant="h6" className="font-semibold">
                  {selectedCategory === 'all' 
                    ? 'All Achievements' 
                    : categories.find(c => c.value === selectedCategory)?.label + ' Achievements'
                  }
                </Typography>
                <Chip 
                  label={`${filteredAchievements.length} total`}
                  size="small"
                  sx={{ bgcolor: '#EFF6FF', color: '#1E40AF', fontWeight: 600 }}
                />
              </Box>
            </Box>

            {loading ? (
              <Box className="text-center py-12">
                <CircularProgress />
              </Box>
            ) : filteredAchievements.length > 0 ? (
              <Grid container spacing={3}>
                <AnimatePresence>
                  {filteredAchievements.map((achievement, index) => {
                    const statusColors = getStatusColor(achievement.status);
                    const CategoryIcon = categories.find(c => c.value === achievement.category)?.icon || Award;
                    
                    return (
                      <Grid item xs={12} md={6} lg={4} key={achievement._id}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Card 
                            className="p-4 hover:shadow-lg transition-all cursor-pointer border h-full"
                            sx={{ borderColor: '#E5E7EB' }}
                          >
                            <Box className="flex items-start justify-between mb-3">
                              <Avatar 
                                className={`${
                                  achievement.status === 'approved' 
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                    : achievement.status === 'pending'
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                    : 'bg-gradient-to-r from-red-400 to-pink-500'
                                }`}
                                sx={{ width: 48, height: 48 }}
                              >
                                <CategoryIcon className="w-6 h-6 text-white" />
                              </Avatar>
                              <Chip 
                                label={achievement.status}
                                size="small"
                                className={`${statusColors.bg} ${statusColors.text} font-semibold capitalize`}
                              />
                            </Box>
                            
                            <Typography variant="h6" className="font-semibold text-gray-900 mb-2">
                              {achievement.title}
                            </Typography>
                            
                            <Typography variant="body2" className="text-gray-600 mb-3" sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {achievement.description}
                            </Typography>
                            
                            <Divider className="my-3" />
                            
                            <Box className="flex items-center justify-between">
                              <Chip 
                                label={achievement.category}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 500 }}
                              />
                              {achievement.points > 0 && (
                                <Chip 
                                  label={`${achievement.points} pts`}
                                  size="small"
                                  className="bg-purple-100 text-purple-700 font-semibold"
                                  icon={<Zap className="w-3 h-3" />}
                                />
                              )}
                            </Box>
                            
                            <Box className="flex items-center gap-1 mt-3">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <Typography variant="caption" className="text-gray-500">
                                {new Date(achievement.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </Typography>
                            </Box>
                          </Card>
                        </motion.div>
                      </Grid>
                    );
                  })}
                </AnimatePresence>
              </Grid>
            ) : (
              <Box className="text-center py-12">
                <Box className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                  <Trophy className="w-12 h-12 text-gray-400" />
                </Box>
                <Typography variant="h6" className="text-gray-600 mb-2">
                  No {selectedCategory !== 'all' ? categories.find(c => c.value === selectedCategory)?.label.toLowerCase() : ''} achievements yet
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  Start adding your achievements to see them here!
                </Typography>
              </Box>
            )}
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
