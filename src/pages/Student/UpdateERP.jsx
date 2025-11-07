import { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import {
  Container, Typography, Stepper, Step, StepLabel, Button, Box, Paper,
  TextField, Grid, MenuItem, IconButton, Chip, CircularProgress, Radio,
  RadioGroup, FormControlLabel, FormControl, FormLabel, Divider
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const steps = ["Academic Details", "Personal Info", "CRT Training", "Review & Submit"];

export default function UpdateERP() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erp, setErp] = useState(null);

  useEffect(() => {
    fetchERP();
  }, []);

  const fetchERP = async () => {
    try {
      const res = await axios.get("/erp/my-erp");
      setErp(res.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load ERP");
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      await handleSubmit();
    } else {
      await saveProgress();
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const saveProgress = async () => {
    try {
      await axios.put("/erp/my-erp", erp);
      toast.success("Progress saved");
    } catch (err) {
      toast.error("Failed to save");
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await axios.put("/erp/my-erp", erp);
      await axios.post("/erp/my-erp/submit");
      toast.success("ERP submitted for verification!");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Container sx={{ mt: 4, textAlign: "center" }}><CircularProgress /></Container>;
  if (!erp) return <Container sx={{ mt: 4 }}><Typography>Error loading ERP</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Update My ERP Profile</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Complete your Educational Record Profile for admin verification
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {activeStep === 0 && <AcademicDetailsForm erp={erp} setErp={setErp} />}
        {activeStep === 1 && <PersonalInfoForm erp={erp} setErp={setErp} />}
        {activeStep === 2 && <CRTTrainingForm erp={erp} setErp={setErp} />}
        {activeStep === 3 && <ReviewSection erp={erp} />}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
          <Button variant="contained" onClick={handleNext} disabled={submitting}>
            {activeStep === steps.length - 1 ? (submitting ? "Submitting..." : "Submit ERP") : "Next"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

// Academic Details Component
function AcademicDetailsForm({ erp, setErp }) {
  // Calculate total semesters based on current semester (e.g., "2-1" = 3 semesters: 1-1, 1-2, 2-1)
  const getTotalSemestersAllowed = () => {
    if (!erp.currentSemester) return 1;
    const [year, sem] = erp.currentSemester.split("-").map(Number);
    return (year - 1) * 2 + sem;
  };

  const generateSemesterName = (index) => {
    const year = Math.floor(index / 2) + 1;
    const sem = (index % 2) + 1;
    return `${year}-${sem}`;
  };

  const addSemester = () => {
    const totalAllowed = getTotalSemestersAllowed();
    const currentCount = (erp.semesters || []).length;
    
    if (currentCount >= totalAllowed) {
      toast.warning(`You can only add up to ${totalAllowed} semesters for current semester ${erp.currentSemester}`);
      return;
    }

    const newSem = {
      semesterName: generateSemesterName(currentCount),
      year: Math.floor(currentCount / 2) + 1,
      semesterNumber: (currentCount % 2) + 1,
      courses: [],
      numberOfCourses: 0,
      sgpa: 0
    };
    setErp({ ...erp, semesters: [...(erp.semesters || []), newSem] });
  };

  const updateSemester = (idx, field, value) => {
    const updated = [...erp.semesters];
    updated[idx][field] = value;
    
    // If number of courses changed, adjust courses array
    if (field === "numberOfCourses") {
      const numCourses = parseInt(value) || 0;
      const currentCourses = updated[idx].courses || [];
      
      if (numCourses > currentCourses.length) {
        // Add more courses
        const toAdd = numCourses - currentCourses.length;
        for (let i = 0; i < toAdd; i++) {
          currentCourses.push({ courseName: "", gpa: 0, grade: "O" });
        }
      } else if (numCourses < currentCourses.length) {
        // Remove extra courses
        currentCourses.length = numCourses;
      }
      updated[idx].courses = currentCourses;
    }
    
    setErp({ ...erp, semesters: updated });
  };

  const updateCourse = (semIdx, courseIdx, field, value) => {
    const updated = [...erp.semesters];
    updated[semIdx].courses[courseIdx][field] = value;
    
    // Auto-calculate SGPA when course GPA changes
    if (field === "gpa") {
      const courses = updated[semIdx].courses;
      const validGPAs = courses.filter(c => c.gpa && c.gpa > 0).map(c => parseFloat(c.gpa));
      if (validGPAs.length > 0) {
        const avgGPA = validGPAs.reduce((sum, gpa) => sum + gpa, 0) / validGPAs.length;
        updated[semIdx].sgpa = parseFloat(avgGPA.toFixed(2));
      }
    }
    
    setErp({ ...erp, semesters: updated });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>B.Tech Academic Details</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            label="Currently Studying Semester (e.g., 2-1, 3-2)" 
            value={erp.currentSemester || ""}
            placeholder="e.g., 2-1"
            onChange={(e) => setErp({ ...erp, currentSemester: e.target.value })}
            helperText="Enter as Year-Semester (e.g., 1-1, 1-2, 2-1, 2-2, etc.)"
          />
        </Grid>
      </Grid>

      {erp.currentSemester && (
        <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
          You can add details for {getTotalSemestersAllowed()} semester(s): {
            Array.from({ length: getTotalSemestersAllowed() }, (_, i) => generateSemesterName(i)).join(", ")
          }
        </Typography>
      )}

      {(erp.semesters || []).map((sem, idx) => (
        <Paper key={idx} sx={{ p: 3, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Semester {sem.semesterName}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                type="number" 
                label="Number of Courses"
                value={sem.numberOfCourses || 0}
                onChange={(e) => updateSemester(idx, "numberOfCourses", e.target.value)}
                inputProps={{ min: 0, max: 15 }}
              />
            </Grid>

            {/* Show course fields based on number of courses */}
            {(sem.courses || []).map((course, courseIdx) => (
              <Grid item xs={12} key={courseIdx}>
                <Paper sx={{ p: 2, bgcolor: "white" }}>
                  <Typography variant="subtitle2" gutterBottom>Course {courseIdx + 1}</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth 
                        label="Course Name"
                        value={course.courseName || ""}
                        onChange={(e) => updateCourse(idx, courseIdx, "courseName", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField 
                        fullWidth 
                        type="number" 
                        label="GPA"
                        value={course.gpa || 0}
                        onChange={(e) => updateCourse(idx, courseIdx, "gpa", parseFloat(e.target.value))}
                        inputProps={{ min: 0, max: 10, step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField 
                        fullWidth
                        select
                        label="Grade"
                        value={course.grade || "O"}
                        onChange={(e) => updateCourse(idx, courseIdx, "grade", e.target.value)}
                      >
                        <MenuItem value="O">O - Outstanding</MenuItem>
                        <MenuItem value="S">S - Super</MenuItem>
                        <MenuItem value="I">I - Incomplete</MenuItem>
                        <MenuItem value="R">R - Repeat</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}

            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="SGPA (Auto-calculated from course GPAs)" 
                type="number" 
                value={sem.sgpa || 0}
                onChange={(e) => updateSemester(idx, "sgpa", parseFloat(e.target.value))}
                inputProps={{ min: 0, max: 10, step: 0.01 }}
                helperText="Automatically calculated as average of all course GPAs"
                InputProps={{
                  style: { backgroundColor: sem.courses?.length > 0 ? '#e3f2fd' : 'white' }
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}
      
      {erp.currentSemester && (erp.semesters || []).length < getTotalSemestersAllowed() && (
        <Button variant="outlined" onClick={addSemester} startIcon={<Add />}>
          Add Semester {generateSemesterName((erp.semesters || []).length)}
        </Button>
      )}
    </Box>
  );
}

// Personal Info Component
function PersonalInfoForm({ erp, setErp }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Personal Details</Typography>
      
      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            label="Full Name" 
            value={erp.fullName || ""}
            onChange={(e) => setErp({ ...erp, fullName: e.target.value })}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField 
            fullWidth 
            required
            label="Phone Number" 
            value={erp.phoneNumber || ""}
            onChange={(e) => setErp({ ...erp, phoneNumber: e.target.value })}
            inputProps={{ maxLength: 10 }}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField 
            fullWidth 
            label="Email" 
            type="email"
            value={erp.email || ""}
            onChange={(e) => setErp({ ...erp, email: e.target.value })}
          />
        </Grid>

        <Grid item xs={12}><Divider><Chip label="Father Details" /></Divider></Grid>

        {/* Father Details */}
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            label="Father Name" 
            value={erp.fatherName || ""}
            onChange={(e) => setErp({ ...erp, fatherName: e.target.value })}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField 
            fullWidth 
            label="Father Phone Number" 
            value={erp.fatherPhone || ""}
            onChange={(e) => setErp({ ...erp, fatherPhone: e.target.value })}
            inputProps={{ maxLength: 10 }}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField 
            fullWidth 
            label="Father Occupation" 
            value={erp.fatherOccupation || ""}
            onChange={(e) => setErp({ ...erp, fatherOccupation: e.target.value })}
          />
        </Grid>

        <Grid item xs={12}><Divider><Chip label="Mother Details" /></Divider></Grid>

        {/* Mother Details */}
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            label="Mother Name" 
            value={erp.motherName || ""}
            onChange={(e) => setErp({ ...erp, motherName: e.target.value })}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField 
            fullWidth 
            label="Mother Phone Number" 
            value={erp.motherPhone || ""}
            onChange={(e) => setErp({ ...erp, motherPhone: e.target.value })}
            inputProps={{ maxLength: 10 }}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField 
            fullWidth 
            label="Mother Occupation" 
            value={erp.motherOccupation || ""}
            onChange={(e) => setErp({ ...erp, motherOccupation: e.target.value })}
          />
        </Grid>

        <Grid item xs={12}><Divider><Chip label="Accommodation" /></Divider></Grid>

        {/* Accommodation Type */}
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Accommodation Type</FormLabel>
            <RadioGroup
              row
              value={erp.accommodationType || "day_scholar"}
              onChange={(e) => setErp({ ...erp, accommodationType: e.target.value })}
            >
              <FormControlLabel value="day_scholar" control={<Radio />} label="Day Scholar" />
              <FormControlLabel value="residential" control={<Radio />} label="Residential" />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        {erp.accommodationType === "day_scholar" && (
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              label="Where are you from?" 
              placeholder="City/Town name"
              value={erp.whereFrom || ""}
              onChange={(e) => setErp({ ...erp, whereFrom: e.target.value })}
            />
          </Grid>
        )}
        
        {erp.accommodationType === "residential" && (
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              multiline
              rows={2}
              label="Residential Address" 
              placeholder="Complete hostel/residential address"
              value={erp.residentialAddress || ""}
              onChange={(e) => setErp({ ...erp, residentialAddress: e.target.value })}
            />
          </Grid>
        )}

        <Grid item xs={12}><Divider><Chip label="Education Background" /></Divider></Grid>

        {/* Intermediate Details */}
        <Grid item xs={6}>
          <TextField 
            fullWidth 
            label="Intermediate Percentage" 
            type="number"
            value={erp.intermediatePercentage || ""}
            onChange={(e) => setErp({ ...erp, intermediatePercentage: parseFloat(e.target.value) })}
            inputProps={{ min: 0, max: 100, step: 0.01 }}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField 
            fullWidth 
            label="Intermediate Board" 
            value={erp.intermediateBoard || ""}
            onChange={(e) => setErp({ ...erp, intermediateBoard: e.target.value })}
            placeholder="e.g., AP Board, CBSE, ICSE"
          />
        </Grid>

        <Grid item xs={12}><Divider><Chip label="Scholarship" /></Divider></Grid>

        {/* Scholarship */}
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Are you currently availing any scholarship?</FormLabel>
            <RadioGroup
              row
              value={erp.scholarshipAvailed ? "yes" : "no"}
              onChange={(e) => setErp({ ...erp, scholarshipAvailed: e.target.value === "yes" })}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        {erp.scholarshipAvailed && (
          <>
            <Grid item xs={6}>
              <TextField 
                fullWidth 
                label="Scholarship Name" 
                value={erp.scholarshipName || ""}
                onChange={(e) => setErp({ ...erp, scholarshipName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth 
                label="Scholarship Amount" 
                value={erp.scholarshipAmount || ""}
                onChange={(e) => setErp({ ...erp, scholarshipAmount: e.target.value })}
                placeholder="e.g., 10000 per year"
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
}

// CRT Training Component
function CRTTrainingForm({ erp, setErp }) {
  const addProject = () => setErp({ ...erp, projects: [...(erp.projects || []), { title: "", description: "", technologies: [] }] });
  const addInternship = () => setErp({ ...erp, internships: [...(erp.internships || []), { company: "", role: "", duration: "" }] });
  const addResearch = () => setErp({ ...erp, researchWorks: [...(erp.researchWorks || []), { title: "", description: "", domain: "", publicationStatus: "In Progress" }] });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>CRT Training: Projects, Internships, Placements & Research</Typography>
      
      {/* Projects Section */}
      <Divider sx={{ my: 2 }}><Chip label="Projects" color="primary" /></Divider>
      {(erp.projects || []).map((proj, idx) => (
        <Paper key={idx} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="subtitle2" gutterBottom>Project {idx + 1}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Project Title" 
                value={proj.title || ""}
                onChange={(e) => {
                  const updated = [...erp.projects];
                  updated[idx].title = e.target.value;
                  setErp({ ...erp, projects: updated });
                }} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                multiline 
                rows={2} 
                label="Description"
                value={proj.description || ""} 
                onChange={(e) => {
                  const updated = [...erp.projects];
                  updated[idx].description = e.target.value;
                  setErp({ ...erp, projects: updated });
                }} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Technologies Used (comma separated)" 
                placeholder="React, Node.js, MongoDB"
                value={proj.technologies?.join(", ") || ""}
                onChange={(e) => {
                  const updated = [...erp.projects];
                  updated[idx].technologies = e.target.value.split(",").map(t => t.trim());
                  setErp({ ...erp, projects: updated });
                }} 
              />
            </Grid>
          </Grid>
        </Paper>
      ))}
      <Button onClick={addProject} startIcon={<Add />} variant="outlined">Add Project</Button>

      {/* Internships Section */}
      <Divider sx={{ my: 3 }}><Chip label="Internships" color="primary" /></Divider>
      {(erp.internships || []).map((intern, idx) => (
        <Paper key={idx} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="subtitle2" gutterBottom>Internship {idx + 1}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField 
                fullWidth 
                label="Company" 
                value={intern.company || ""}
                onChange={(e) => {
                  const updated = [...erp.internships];
                  updated[idx].company = e.target.value;
                  setErp({ ...erp, internships: updated });
                }} 
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth 
                label="Role" 
                value={intern.role || ""}
                onChange={(e) => {
                  const updated = [...erp.internships];
                  updated[idx].role = e.target.value;
                  setErp({ ...erp, internships: updated });
                }} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Duration" 
                placeholder="e.g., 2 months, 3 months"
                value={intern.duration || ""}
                onChange={(e) => {
                  const updated = [...erp.internships];
                  updated[idx].duration = e.target.value;
                  setErp({ ...erp, internships: updated });
                }} 
              />
            </Grid>
          </Grid>
        </Paper>
      ))}
      <Button onClick={addInternship} startIcon={<Add />} variant="outlined">Add Internship</Button>

      {/* Research Works Section */}
      <Divider sx={{ my: 3 }}><Chip label="Research Works" color="success" /></Divider>
      {(erp.researchWorks || []).map((research, idx) => (
        <Paper key={idx} sx={{ p: 2, mb: 2, bgcolor: "success.50" }}>
          <Typography variant="subtitle2" gutterBottom>Research {idx + 1}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Research Title" 
                value={research.title || ""}
                onChange={(e) => {
                  const updated = [...(erp.researchWorks || [])];
                  updated[idx].title = e.target.value;
                  setErp({ ...erp, researchWorks: updated });
                }} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                multiline 
                rows={2} 
                label="Description"
                value={research.description || ""} 
                onChange={(e) => {
                  const updated = [...(erp.researchWorks || [])];
                  updated[idx].description = e.target.value;
                  setErp({ ...erp, researchWorks: updated });
                }} 
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth 
                label="Domain" 
                placeholder="AI/ML, IoT, Web Dev, etc."
                value={research.domain || ""}
                onChange={(e) => {
                  const updated = [...(erp.researchWorks || [])];
                  updated[idx].domain = e.target.value;
                  setErp({ ...erp, researchWorks: updated });
                }} 
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                select
                fullWidth 
                label="Publication Status"
                value={research.publicationStatus || "In Progress"}
                onChange={(e) => {
                  const updated = [...(erp.researchWorks || [])];
                  updated[idx].publicationStatus = e.target.value;
                  setErp({ ...erp, researchWorks: updated });
                }} 
              >
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Under Review">Under Review</MenuItem>
                <MenuItem value="Published">Published</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Guide Name (if any)" 
                value={research.guideName || ""}
                onChange={(e) => {
                  const updated = [...(erp.researchWorks || [])];
                  updated[idx].guideName = e.target.value;
                  setErp({ ...erp, researchWorks: updated });
                }} 
              />
            </Grid>
          </Grid>
        </Paper>
      ))}
      <Button onClick={addResearch} startIcon={<Add />} variant="outlined" color="success">Add Research Work</Button>
    </Box>
  );
}

// Review Component
function ReviewSection({ erp }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Review Your ERP</Typography>
      
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" color="primary" gutterBottom>Academic Summary</Typography>
        <Typography><strong>Current Semester:</strong> {erp.currentSemester}</Typography>
        <Typography><strong>Total Semesters Added:</strong> {erp.semesters?.length || 0}</Typography>
        <Typography><strong>Overall CGPA:</strong> {erp.overallCGPA || "Will be calculated"}</Typography>
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" color="primary" gutterBottom>Personal Details</Typography>
        <Typography><strong>Full Name:</strong> {erp.fullName || "Not provided"}</Typography>
        <Typography><strong>Phone:</strong> {erp.phoneNumber}</Typography>
        <Typography><strong>Email:</strong> {erp.email || "Not provided"}</Typography>
        <Typography><strong>Father:</strong> {erp.fatherName || "Not provided"}</Typography>
        <Typography><strong>Mother:</strong> {erp.motherName || "Not provided"}</Typography>
        <Typography><strong>Accommodation:</strong> {erp.accommodationType === "day_scholar" ? "Day Scholar" : "Residential"}</Typography>
        <Typography><strong>Intermediate %:</strong> {erp.intermediatePercentage || "Not provided"}</Typography>
        <Typography><strong>Scholarship:</strong> {erp.scholarshipAvailed ? `Yes - ${erp.scholarshipName}` : "No"}</Typography>
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" color="primary" gutterBottom>CRT Training</Typography>
        <Typography><strong>Projects:</strong> {erp.projects?.length || 0}</Typography>
        <Typography><strong>Internships:</strong> {erp.internships?.length || 0}</Typography>
        <Typography><strong>Research Works:</strong> {erp.researchWorks?.length || 0}</Typography>
        <Typography><strong>Placements:</strong> {erp.placements?.length || 0}</Typography>
      </Paper>
      
      <Paper sx={{ p: 2, bgcolor: "warning.light" }}>
        <Typography color="warning.dark" fontWeight={600}>
          ⚠️ Important: Once submitted, your ERP will be sent to admin for verification. Make sure all information is accurate.
        </Typography>
      </Paper>
    </Box>
  );
}
