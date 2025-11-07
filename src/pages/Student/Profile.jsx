import { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import { Container, Typography, Avatar, Button, Box, CircularProgress, Paper, Divider, Card, Grid, Chip, IconButton, LinearProgress, Tab, Tabs, Badge, Skeleton } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, MapPin, Calendar, Award, Trophy, Star, 
  Upload, FileText, Download, Camera, Edit2, Save, X, 
  Github, Linkedin, Twitter, Globe, Book, Briefcase, 
  TrendingUp, Target, Zap, Shield, CheckCircle, Clock,
  Medal, Plus
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [stats, setStats] = useState({
    achievements: 0,
    rank: 0,
    completionRate: 0,
    badges: 0
  });

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/auth/me");
      setProfile(res.data);
      
      // Mock stats (would come from API)
      setStats({
        achievements: Math.floor(Math.random() * 20) + 5,
        rank: Math.floor(Math.random() * 10) + 1,
        completionRate: 85,
        badges: Math.floor(Math.random() * 5) + 1
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      toast.error("Failed to load profile");
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (type === 'profile') {
        setFile(e.dataTransfer.files[0]);
      } else {
        setResume(e.dataTransfer.files[0]);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfilePic = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("profilePic", file);
      const res = await axios.post("/auth/upload-profile", fd);
      toast.success(res.data.message || "Profile picture updated!");
      setFile(null);
      // Refresh profile data
      await fetchProfile();
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleResume = async () => {
    if (!resume) {
      toast.error("Please select a file first");
      return;
    }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("resume", resume);
      const res = await axios.post("/auth/upload-resume", fd);
      toast.success(res.data.message || "Resume uploaded!");
      setResume(null);
      // Refresh profile data
      await fetchProfile();
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <CircularProgress />
    </Box>
  );

  if (!profile) return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Container sx={{ pt: 8 }}>
        <Card className="p-8 text-center">
          <Typography variant="h6" className="text-gray-600">Failed to load profile</Typography>
          <Button onClick={fetchProfile} className="mt-4">Retry</Button>
        </Card>
      </Container>
    </Box>
  );

  const statCards = [
    { title: "Total Points", value: profile.totalPoints || 0, icon: Trophy, color: "#F59E0B" },
    { title: "Achievements", value: stats.achievements, icon: Award, color: "#3B82F6" },
    { title: "Your Rank", value: `#${stats.rank}`, icon: Medal, color: "#A855F7" },
    { title: "Completion", value: `${stats.completionRate}%`, icon: Target, color: "#10B981" }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      {/* Hero Section with Cover */}
      <Box sx={{ position: 'relative', height: '16rem', backgroundColor: '#6366F1' }}>
        <Container maxWidth="lg" className="relative h-full">
          <Box className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
            <Box className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton 
                      className="bg-white shadow-lg p-2"
                      component="label"
                    >
                      <Camera className="w-4 h-4 text-gray-700" />
                      <input 
                        hidden 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </IconButton>
                  }
                >
                  <Avatar
                    src={profile.profilePicUrl ? `http://localhost:5000${profile.profilePicUrl}` : undefined}
                    sx={{ 
                      width: 128, 
                      height: 128, 
                      border: '4px solid white',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                      backgroundColor: '#6366F1',
                      fontSize: '3rem', 
                      fontWeight: 700 
                    }}
                  >
                    {profile.name?.[0] || 'U'}
                  </Avatar>
                </Badge>
                {file && (
                  <Box className="absolute -bottom-4 left-0 right-0 flex justify-center gap-2">
                    <IconButton 
                      size="small" 
                      className="bg-green-500 text-white hover:bg-green-600"
                      onClick={handleProfilePic}
                      disabled={uploading}
                    >
                      <Save className="w-4 h-4" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={() => setFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </IconButton>
                  </Box>
                )}
              </motion.div>

              {/* Name and Info */}
              <Box className="flex-1 text-center md:text-left pb-6 bg-white rounded-xl px-6 py-4 shadow-xl">
                <Typography 
                  variant="h4" 
                  className="font-bold text-gray-900 mb-1"
                  sx={{ fontFamily: 'Poppins' }}
                >
                  {profile.name}
                </Typography>
                <Box className="flex flex-wrap items-center gap-3 text-gray-600">
                  <Box className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <Typography variant="body2">{profile.email}</Typography>
                  </Box>
                  <Box className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <Typography variant="body2">Roll: {profile.rollNumber}</Typography>
                  </Box>
                  <Box className="flex items-center gap-1">
                    <Book className="w-4 h-4" />
                    <Typography variant="body2">Dept: {profile.department}</Typography>
                  </Box>
                  <Box className="flex items-center gap-1">
                    <Book className="w-4 h-4" />
                    <Typography variant="body2">Section: {profile.section}</Typography>
                  </Box>
                  <Box className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <Typography variant="body2">Year: {profile.year}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" className="mt-32 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Stats Cards */}
          <Grid container spacing={3} className="mb-8">
            {statCards.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card 
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '8px', backgroundColor: stat.color, mb: 2 }}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {stat.title}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Tabs Section */}
          <Card className="shadow-xl">
            <Tabs 
              value={activeTab} 
              onChange={(e, v) => setActiveTab(v)}
              className="border-b"
            >
              <Tab label="Overview" icon={<User className="w-4 h-4" />} iconPosition="start" />
              <Tab label="Documents" icon={<FileText className="w-4 h-4" />} iconPosition="start" />
              <Tab label="Skills & Badges" icon={<Award className="w-4 h-4" />} iconPosition="start" />
              <Tab label="Activity" icon={<TrendingUp className="w-4 h-4" />} iconPosition="start" />
            </Tabs>

            <Box className="p-6">
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  {/* Personal Information */}
                  <Grid item xs={12} md={6}>
                    <Box className="mb-6">
                      <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" /> Personal Information
                      </Typography>
                      <Box className="space-y-3">
                        {[
                          { label: "Full Name", value: profile.name },
                          { label: "Email", value: profile.email },
                          { label: "Roll Number", value: profile.rollNumber },
                          { label: "Section", value: profile.section },
                          { label: "Year", value: profile.year }
                        ].map((item, i) => (
                          <Box key={i} className="flex justify-between py-2 border-b border-gray-100">
                            <Typography variant="body2" className="text-gray-600">{item.label}</Typography>
                            <Typography variant="body2" className="font-medium">{item.value}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Quick Actions */}
                  <Grid item xs={12} md={6}>
                    <Box className="mb-6">
                      <Typography variant="h6" className="font-semibold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5" /> Quick Actions
                      </Typography>
                      <Box className="space-y-2">
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigate("/update-erp")}
                          className="justify-start normal-case py-3"
                          startIcon={<FileText className="w-5 h-5" />}
                        >
                          Update ERP Profile
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigate("/add")}
                          className="justify-start normal-case py-3"
                          startIcon={<Plus className="w-5 h-5" />}
                        >
                          Add Achievement
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigate("/dashboard")}
                          className="justify-start normal-case py-3"
                          startIcon={<Trophy className="w-5 h-5" />}
                        >
                          View Achievements
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Box>
                  {/* Resume Upload */}
                  <Box 
                    className={`p-8 border-2 border-dashed rounded-xl text-center ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, 'resume')}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <Typography variant="h6" className="mb-2">Drop your resume here</Typography>
                    <Typography variant="body2" className="text-gray-600 mb-4">
                      or click to browse (PDF, DOC, DOCX)
                    </Typography>
                    <Button
                      component="label"
                      variant="contained"
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      Choose File
                      <input 
                        hidden 
                        type="file" 
                        accept=".pdf,.doc,.docx" 
                        onChange={(e) => setResume(e.target.files[0])}
                      />
                    </Button>
                    {resume && (
                      <Box className="mt-4 p-3 bg-green-100 rounded-lg">
                        <Typography className="text-green-800">
                          Selected: {resume.name}
                        </Typography>
                        <Box className="flex justify-center gap-2 mt-2">
                          <Button 
                            size="small" 
                            onClick={handleResume}
                            disabled={uploading}
                            className="bg-green-600 text-white"
                          >
                            {uploading ? "Uploading..." : "Upload"}
                          </Button>
                          <Button 
                            size="small" 
                            onClick={() => setResume(null)}
                            className="bg-red-600 text-white"
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {profile.resumeUrl && (
                    <Card className="mt-4 p-4 flex items-center justify-between">
                      <Box className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <Box>
                          <Typography variant="subtitle1" className="font-semibold">
                            Current Resume
                          </Typography>
                          <Typography variant="caption" className="text-gray-600">
                            Last updated: {new Date().toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        href={`http://localhost:5000${profile.resumeUrl}`}
                        target="_blank"
                        variant="contained"
                        startIcon={<Download className="w-4 h-4" />}
                      >
                        Download
                      </Button>
                    </Card>
                  )}
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" className="mb-4">Skills & Achievements</Typography>
                  <Box className="flex flex-wrap gap-2 mb-6">
                    {['React', 'Node.js', 'Python', 'Machine Learning', 'AWS', 'Docker'].map((skill) => (
                      <Chip 
                        key={skill}
                        label={skill}
                        className="bg-gradient-to-r from-blue-100 to-purple-100 font-medium"
                      />
                    ))}
                  </Box>
                  <Typography variant="h6" className="mb-4">Badges Earned</Typography>
                  <Grid container spacing={2}>
                    {[1, 2, 3, 4].map((badge) => (
                      <Grid item xs={6} sm={3} key={badge}>
                        <Card className="p-4 text-center hover:shadow-lg transition-all">
                          <Star className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
                          <Typography variant="caption">Achievement Badge</Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" className="mb-4">Recent Activity</Typography>
                  <Box className="space-y-3">
                    {[
                      { text: "Achievement approved", time: "2 hours ago", icon: CheckCircle, color: "text-green-600" },
                      { text: "Profile updated", time: "1 day ago", icon: User, color: "text-blue-600" },
                      { text: "New badge earned", time: "3 days ago", icon: Award, color: "text-purple-600" },
                      { text: "Points milestone reached", time: "1 week ago", icon: Trophy, color: "text-yellow-600" }
                    ].map((activity, i) => (
                      <Box key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                        <activity.icon className={`w-5 h-5 ${activity.color}`} />
                        <Box className="flex-1">
                          <Typography variant="body2">{activity.text}</Typography>
                          <Typography variant="caption" className="text-gray-500">{activity.time}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
