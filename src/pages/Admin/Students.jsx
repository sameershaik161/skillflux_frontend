import { useState, useEffect } from "react";
import { 
  Container, Typography, Box, Card, Grid, Avatar, Chip, 
  TextField, MenuItem, InputAdornment, IconButton, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Tabs, Tab, Skeleton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Divider, List, ListItem, ListItemText
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { 
  Users, Search, Filter, Download, Mail, Phone, 
  Award, TrendingUp, ArrowLeft, BookOpen, GraduationCap
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getFileUrl } from "../../config/api";

export default function Students() {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedSection, setSelectedSection] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or table
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filterType, setFilterType] = useState(location.state?.filterType || null);
  const [achievementCategoryFilter, setAchievementCategoryFilter] = useState("All");
  const [mainCategoryFilter, setMainCategoryFilter] = useState("All"); // For main page filter

  const achievementCategories = [
    "All",
    "Academic Certifications",
    "Sports Competition Certification",
    "Cultural Certification",
    "Co-ordinator Certificates"
  ];

  const departments = ["All", "CSE", "ECE", "Civil", "EEE", "Mechanical", "IT", "Chemical", "Biotech"];
  const sections = ["All", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S"];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log("Fetching students from /admin/students...");
      console.log("Token:", localStorage.getItem("token"));
      console.log("Role:", localStorage.getItem("role"));
      
      const res = await axios.get("/admin/students");
      console.log("Fetched students successfully:", res.data);
      
      const studentsData = res.data.students || [];
      console.log("Number of students:", studentsData.length);
      
      // Set default department for students without one
      const normalizedStudents = studentsData.map(s => ({
        ...s,
        department: s.department || "CSE", // Default to CSE if no department
        achievements: s.achievements || []
      }));
      setStudents(normalizedStudents);
      
      if (normalizedStudents.length === 0) {
        toast.info("No students found in database");
      }
    } catch (err) {
      console.error("Failed to fetch students - Full error:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      
      const errorMsg = err.response?.status === 404 
        ? "Students endpoint not found. Please restart the backend server."
        : err.response?.status === 401
        ? "Unauthorized. Please login again."
        : err.response?.data?.message || err.message;
      
      toast.error("Failed to load students: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Filter students by department, section, search query, achievement status, and category
  const filteredStudents = students.filter(student => {
    const matchesDepartment = selectedDepartment === "All" || student.department === selectedDepartment;
    const matchesSection = selectedSection === "All" || student.section === selectedSection;
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAchievementFilter = filterType === 'withAchievements' 
      ? (student.achievements && student.achievements.filter(a => a.status === 'approved').length > 0)
      : true;
    
    // Category filter - check if student has achievements in the selected category
    const matchesCategoryFilter = mainCategoryFilter === "All" 
      ? true
      : student.achievements && student.achievements.some(a => 
          a.category === mainCategoryFilter && a.status === 'approved'
        );
    
    return matchesDepartment && matchesSection && matchesSearch && matchesAchievementFilter && matchesCategoryFilter;
  });

  // Group students by department
  const studentsByDepartment = departments
    .filter(dept => dept !== "All")
    .map(dept => {
      const deptStudents = students.filter(s => {
        const matchesDept = s.department === dept;
        const matchesAchievementFilter = filterType === 'withAchievements' 
          ? (s.achievements && s.achievements.filter(a => a.status === 'approved').length > 0)
          : true;
        return matchesDept && matchesAchievementFilter;
      });
      return {
        department: dept,
        students: deptStudents,
        count: deptStudents.length
      };
    });

  // Group students by section for selected department
  const studentsBySection = sections
    .filter(sec => sec !== "All")
    .map(sec => ({
      section: sec,
      count: students.filter(s => {
        const matchesDept = selectedDepartment === "All" || s.department === selectedDepartment;
        const matchesSection = s.section === sec;
        const matchesAchievementFilter = filterType === 'withAchievements' 
          ? (s.achievements && s.achievements.filter(a => a.status === 'approved').length > 0)
          : true;
        return matchesDept && matchesSection && matchesAchievementFilter;
      }).length
    }))
    .filter(sec => sec.count > 0); // Only show sections with students

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Roll Number', 'Email', 'Department', 'Section', 'Year', 'Points', 'Achievements'].join(','),
      ...filteredStudents.map(s => 
        [s.name, s.rollNumber, s.email, s.department, s.section, s.year, s.totalPoints || 0, s.achievements?.length || 0].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Generate filename based on filters
    let fileName = 'students';
    if (selectedDepartment !== "All") {
      fileName += `_${selectedDepartment}`;
    }
    if (selectedSection !== "All") {
      fileName += `_Section${selectedSection}`;
    }
    fileName += `_${new Date().toISOString().split('T')[0]}.csv`;
    
    a.download = fileName;
    a.click();
    
    const filterInfo = selectedDepartment !== "All" 
      ? (selectedSection !== "All" ? `${selectedDepartment} - Section ${selectedSection}` : selectedDepartment)
      : "All departments";
    toast.success(`Exported ${filteredStudents.length} students from ${filterInfo}`);
  };

  const handleViewStudent = async (student) => {
    try {
      // Fetch full student details with achievements
      const res = await axios.get(`/admin/students/${student._id}`);
      setSelectedStudent(res.data.student);
      setOpenDialog(true);
    } catch (err) {
      console.error("Failed to fetch student details:", err);
      toast.error("Failed to load student details");
    }
  };

  const handleDownloadCertificate = async (achievement) => {
    if (achievement.certificateUrl) {
      window.open(getFileUrl(achievement.certificateUrl), '_blank');
    } else {
      toast.error("No certificate available");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setAchievementCategoryFilter("All"); // Reset filter when closing
  };

  // Filter achievements by category
  const getFilteredAchievements = (achievements) => {
    if (!achievements) return [];
    if (achievementCategoryFilter === "All") return achievements;
    return achievements.filter(a => a.category === achievementCategoryFilter);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Container maxWidth="xl" className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Box className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <Box className="flex items-center gap-4">
              <IconButton 
                onClick={() => navigate('/admin')}
                sx={{ 
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  '&:hover': { backgroundColor: '#F9FAFB' }
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </IconButton>
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    color: '#1F2937',
                    mb: 0.5
                  }}
                >
                  {filterType === 'withAchievements' ? 'Students with Achievements' : 'All Students'}
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                  {filterType === 'withAchievements' 
                    ? `${filteredStudents.length} students with approved achievements`
                    : `Total ${students.length} students across all departments`
                  }
                </Typography>
              </Box>
            </Box>
            
            <Box className="flex gap-2 mt-4 md:mt-0">
              {filterType === 'withAchievements' && (
                <Button
                  variant="outlined"
                  startIcon={<Filter className="w-4 h-4" />}
                  onClick={() => setFilterType(null)}
                  sx={{
                    borderColor: '#6366F1',
                    color: '#6366F1',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#4F46E5',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)'
                    }
                  }}
                >
                  Clear Filter
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Download className="w-4 h-4" />}
                onClick={handleExportCSV}
                disabled={filteredStudents.length === 0}
                sx={{
                  backgroundColor: '#10B981',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#059669'
                  },
                  '&:disabled': {
                    backgroundColor: '#E5E7EB',
                    color: '#9CA3AF'
                  }
                }}
              >
                Download CSV ({filteredStudents.length})
              </Button>
            </Box>
          </Box>

          {/* Department Statistics */}
          <Grid container spacing={3} className="mb-6">
            {studentsByDepartment.map((dept, index) => (
              <Grid item xs={6} sm={4} md={3} lg={1.5} key={dept.department}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Card
                    elevation={0}
                    onClick={() => setSelectedDepartment(dept.department)}
                    sx={{
                      p: 2,
                      backgroundColor: selectedDepartment === dept.department ? '#6366F1' : 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        borderColor: '#6366F1'
                      }
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700, 
                        color: selectedDepartment === dept.department ? 'white' : '#1F2937',
                        mb: 0.5 
                      }}
                    >
                      {dept.count}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: selectedDepartment === dept.department ? 'rgba(255,255,255,0.9)' : '#6B7280',
                        fontSize: '0.75rem'
                      }}
                    >
                      {dept.department}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Filters */}
          <Card 
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px'
            }}
          >
            {(filterType === 'withAchievements' || mainCategoryFilter !== "All") && (
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {filterType === 'withAchievements' && (
                  <Chip
                    icon={<Award className="w-4 h-4" />}
                    label="Showing only students with approved achievements"
                    onDelete={() => setFilterType(null)}
                    sx={{
                      backgroundColor: '#EEF2FF',
                      color: '#6366F1',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': {
                        color: '#6366F1'
                      }
                    }}
                  />
                )}
                {mainCategoryFilter !== "All" && (
                  <Chip
                    icon={<Filter className="w-4 h-4" />}
                    label={`Category: ${mainCategoryFilter}`}
                    onDelete={() => setMainCategoryFilter("All")}
                    sx={{
                      backgroundColor: '#FEF3C7',
                      color: '#D97706',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': {
                        color: '#D97706'
                      }
                    }}
                  />
                )}
              </Box>
            )}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by name, email, or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search className="w-5 h-5 text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <TextField
                  fullWidth
                  select
                  label="Department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Section"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                >
                  {sections.map((section) => {
                    const sectionCount = section === "All" 
                      ? students.filter(s => {
                          const matchesDept = selectedDepartment === "All" || s.department === selectedDepartment;
                          const matchesAchievementFilter = filterType === 'withAchievements' 
                            ? (s.achievements && s.achievements.filter(a => a.status === 'approved').length > 0)
                            : true;
                          return matchesDept && matchesAchievementFilter;
                        }).length
                      : students.filter(s => {
                          const matchesDept = selectedDepartment === "All" || s.department === selectedDepartment;
                          const matchesSection = s.section === section;
                          const matchesAchievementFilter = filterType === 'withAchievements' 
                            ? (s.achievements && s.achievements.filter(a => a.status === 'approved').length > 0)
                            : true;
                          return matchesDept && matchesSection && matchesAchievementFilter;
                        }).length;
                    return (
                      <MenuItem key={section} value={section}>
                        {section === "All" ? "All" : section} {sectionCount > 0 ? `(${sectionCount})` : ""}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={mainCategoryFilter}
                  onChange={(e) => setMainCategoryFilter(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                >
                  {achievementCategories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2.5}>
                <Box className="flex gap-2">
                  <Button
                    fullWidth
                    variant={viewMode === "grid" ? "contained" : "outlined"}
                    onClick={() => setViewMode("grid")}
                    sx={{
                      textTransform: 'none',
                      backgroundColor: viewMode === "grid" ? '#6366F1' : 'transparent',
                      borderColor: '#E5E7EB',
                      color: viewMode === "grid" ? 'white' : '#6B7280',
                      '&:hover': {
                        backgroundColor: viewMode === "grid" ? '#4F46E5' : 'rgba(99, 102, 241, 0.05)'
                      }
                    }}
                  >
                    Grid
                  </Button>
                  <Button
                    fullWidth
                    variant={viewMode === "table" ? "contained" : "outlined"}
                    onClick={() => setViewMode("table")}
                    sx={{
                      textTransform: 'none',
                      backgroundColor: viewMode === "table" ? '#6366F1' : 'transparent',
                      borderColor: '#E5E7EB',
                      color: viewMode === "table" ? 'white' : '#6B7280',
                      '&:hover': {
                        backgroundColor: viewMode === "table" ? '#4F46E5' : 'rgba(99, 102, 241, 0.05)'
                      }
                    }}
                  >
                    Table
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* Students Display */}
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px' }} />
                </Grid>
              ))}
            </Grid>
          ) : filteredStudents.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                p: 8,
                textAlign: 'center',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px'
              }}
            >
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
                No students found
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Try adjusting your filters or search query
              </Typography>
            </Card>
          ) : viewMode === "grid" ? (
            <Grid container spacing={3}>
              {filteredStudents.map((student, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={student._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card
                      elevation={0}
                      onClick={() => handleViewStudent(student)}
                      sx={{
                        p: 3,
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                          borderColor: '#6366F1'
                        }
                      }}
                    >
                      {/* Avatar and Name */}
                      <Box className="flex flex-col items-center mb-3">
                        <Avatar
                          src={student.profilePicUrl ? getFileUrl(student.profilePicUrl) : undefined}
                          sx={{
                            width: 80,
                            height: 80,
                            backgroundColor: '#6366F1',
                            fontSize: '2rem',
                            fontWeight: 700,
                            mb: 2
                          }}
                        >
                          {student.name?.[0] || 'S'}
                        </Avatar>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#1F2937',
                            textAlign: 'center',
                            mb: 0.5
                          }}
                        >
                          {student.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                          {student.rollNumber}
                        </Typography>
                      </Box>

                      {/* Department and Details */}
                      <Box className="space-y-2 mb-3">
                        <Box className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            {student.department} - {student.section}
                          </Typography>
                        </Box>
                        <Box className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            Year {student.year}
                          </Typography>
                        </Box>
                        <Box className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#6B7280',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {student.email}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Stats */}
                      <Box className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <Box className="text-center">
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366F1' }}>
                            {student.totalPoints || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            Points
                          </Typography>
                        </Box>
                        <Box className="text-center">
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
                            {student.achievements?.length || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            Achievements
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          ) : (
            <TableContainer 
              component={Paper} 
              elevation={0}
              sx={{
                border: '1px solid #E5E7EB',
                borderRadius: '12px'
              }}
            >
              <Table>
                <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Roll Number</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Section</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Year</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Points</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Achievements</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow 
                      key={student._id}
                      onClick={() => handleViewStudent(student)}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#F9FAFB',
                          cursor: 'pointer'
                        }
                      }}
                    >
                      <TableCell>
                        <Box className="flex items-center gap-3">
                          <Avatar
                            src={student.profilePicUrl ? getFileUrl(student.profilePicUrl) : undefined}
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: '#6366F1'
                            }}
                          >
                            {student.name?.[0] || 'S'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                              {student.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                              {student.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          {student.rollNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={student.department}
                          size="small"
                          sx={{
                            backgroundColor: '#6366F1',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          {student.section}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          Year {student.year}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#6366F1' }}>
                          {student.totalPoints || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#10B981' }}>
                          {student.achievements?.length || 0}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Student Detail Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ backgroundColor: '#6366F1', color: 'white', fontWeight: 700 }}>
              Student Profile
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              {selectedStudent && (
                <Box>
                  {/* Student Info */}
                  <Box className="flex items-center gap-4 mb-4">
                    <Avatar
                      src={selectedStudent.profilePicUrl ? getFileUrl(selectedStudent.profilePicUrl) : undefined}
                      sx={{
                        width: 100,
                        height: 100,
                        backgroundColor: '#6366F1',
                        fontSize: '2.5rem',
                        fontWeight: 700
                      }}
                    >
                      {selectedStudent.name?.[0] || 'S'}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#1F2937', mb: 1 }}>
                        {selectedStudent.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        <strong>Roll Number:</strong> {selectedStudent.rollNumber}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                        <strong>Email:</strong> {selectedStudent.email}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        <strong>Department:</strong> {selectedStudent.department} | <strong>Section:</strong> {selectedStudent.section} | <strong>Year:</strong> {selectedStudent.year}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Stats */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Card elevation={0} sx={{ p: 2, backgroundColor: '#F9FAFB', textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366F1' }}>
                          {selectedStudent.totalPoints || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          Total Points
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card elevation={0} sx={{ p: 2, backgroundColor: '#F9FAFB', textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
                          {selectedStudent.achievements?.length || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          Achievements
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Achievements List */}
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937', mb: 2 }}>
                    Achievements & Certificates
                  </Typography>
                  
                  {/* Category Filter */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#6B7280' }}>Filter by Category:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {achievementCategories.map((cat) => (
                        <Chip
                          key={cat}
                          label={cat}
                          onClick={() => setAchievementCategoryFilter(cat)}
                          color={achievementCategoryFilter === cat ? "primary" : "default"}
                          variant={achievementCategoryFilter === cat ? "filled" : "outlined"}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: achievementCategoryFilter === cat ? '#4F46E5' : 'rgba(99, 102, 241, 0.1)'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {selectedStudent.achievements && selectedStudent.achievements.length > 0 ? (
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {getFilteredAchievements(selectedStudent.achievements).length > 0 ? (
                        getFilteredAchievements(selectedStudent.achievements).map((achievement, idx) => (
                        <ListItem 
                          key={idx}
                          sx={{
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            mb: 1,
                            backgroundColor: 'white'
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1F2937' }}>
                                {achievement.title}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                                  {achievement.description}
                                </Typography>
                                <Box className="flex gap-2 items-center" sx={{ flexWrap: 'wrap' }}>
                                  <Chip 
                                    label={achievement.category || "Uncategorized"}
                                    size="small"
                                    sx={{
                                      backgroundColor: '#6366F1',
                                      color: 'white',
                                      fontWeight: 600
                                    }}
                                  />
                                  <Chip 
                                    label={achievement.status}
                                    size="small"
                                    sx={{
                                      backgroundColor: 
                                        achievement.status === 'approved' ? '#10B981' :
                                        achievement.status === 'pending' ? '#F59E0B' : '#EF4444',
                                      color: 'white',
                                      fontWeight: 600
                                    }}
                                  />
                                  <Chip 
                                    label={`${achievement.points || 0} points`}
                                    size="small"
                                    sx={{ backgroundColor: '#E5E7EB', fontWeight: 600 }}
                                  />
                                  {achievement.certificateUrl && (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<Download className="w-4 h-4" />}
                                      onClick={() => handleDownloadCertificate(achievement)}
                                      sx={{
                                        borderColor: '#6366F1',
                                        color: '#6366F1',
                                        textTransform: 'none',
                                        '&:hover': {
                                          backgroundColor: 'rgba(99, 102, 241, 0.05)'
                                        }
                                      }}
                                    >
                                      Download Certificate
                                    </Button>
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: '#9CA3AF', textAlign: 'center', py: 3 }}>
                          No achievements found for "{achievementCategoryFilter}" category
                        </Typography>
                      )}
                    </List>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#9CA3AF', textAlign: 'center', py: 3 }}>
                      No achievements yet
                    </Typography>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                onClick={handleCloseDialog}
                variant="contained"
                sx={{
                  backgroundColor: '#6366F1',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#4F46E5'
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
}
