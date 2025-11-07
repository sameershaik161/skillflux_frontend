import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import {
  Container, Typography, Paper, Button, Stack, TextField, Box, Chip,
  CircularProgress, Tabs, Tab, Grid, Accordion, AccordionSummary, AccordionDetails,
  Table, TableHead, TableRow, TableCell, TableBody, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { toast } from "react-toastify";

export default function ManageERPs() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [selectedERP, setSelectedERP] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verifyPoints, setVerifyPoints] = useState(100);
  const [adminNote, setAdminNote] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const status = tab === 0 ? "submitted" : tab === 1 ? "verified" : "rejected";
      const res = await axios.get(`/erp/admin/all?status=${status}`);
      setList(res.data);
    } catch (err) {
      console.error("Failed to load ERPs:", err);
      toast.error("Failed to load ERPs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  const handleView = (erp) => {
    setSelectedERP(erp);
    setDialogOpen(true);
    setVerifyPoints(100);
    setAdminNote("");
  };

  const handleVerify = async () => {
    try {
      await axios.put(`/erp/admin/${selectedERP._id}/verify`, {
        action: "verify",
        points: verifyPoints,
        adminNote
      });
      toast.success(`ERP verified with ${verifyPoints} points!`);
      setDialogOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to verify");
    }
  };

  const handleReject = async () => {
    try {
      await axios.put(`/erp/admin/${selectedERP._id}/verify`, {
        action: "reject",
        adminNote
      });
      toast.error("ERP rejected!");
      setDialogOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Manage Student ERPs</Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Submitted" />
        <Tab label="Verified" />
        <Tab label="Rejected" />
      </Tabs>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : list.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
          No {tab === 0 ? "submitted" : tab === 1 ? "verified" : "rejected"} ERPs
        </Typography>
      ) : (
        list.map((erp) => (
          <Paper key={erp._id} sx={{ p: 3, my: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography variant="h6">{erp.student?.name}</Typography>
                <Typography variant="body2">Roll: {erp.student?.rollNumber}</Typography>
                <Typography variant="body2">Section: {erp.student?.section}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip label={`Year ${erp.currentYear}`} size="small" />
                  <Chip label={`Sem ${erp.currentSemester}`} size="small" color="primary" />
                  <Chip label={`CGPA: ${erp.overallCGPA || "N/A"}`} size="small" color="success" />
                </Stack>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: "right" }}>
                <Button variant="contained" onClick={() => handleView(erp)}>
                  View Details
                </Button>
                {erp.erpPoints > 0 && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    Points: {erp.erpPoints}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        ))
      )}

      {/* ERP Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedERP && (
          <>
            <DialogTitle>
              ERP Details - {selectedERP.student?.name}
            </DialogTitle>
            <DialogContent>
              <ERPDetailsView erp={selectedERP} />
              
              {tab === 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <TextField
                    fullWidth
                    label="Points to Award"
                    type="number"
                    value={verifyPoints}
                    onChange={(e) => setVerifyPoints(parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Admin Note (Optional)"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              {tab === 0 && (
                <>
                  <Button color="error" onClick={handleReject}>Reject</Button>
                  <Button variant="contained" color="success" onClick={handleVerify}>
                    Verify & Award Points
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}

// Component to display ERP details
function ERPDetailsView({ erp }) {
  return (
    <Box>
      {/* Personal Info */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Personal Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}><Divider><strong>Basic Details</strong></Divider></Grid>
            <Grid item xs={6}><Typography><strong>Full Name:</strong> {erp.fullName || "N/A"}</Typography></Grid>
            <Grid item xs={6}><Typography><strong>Phone:</strong> {erp.phoneNumber}</Typography></Grid>
            <Grid item xs={6}><Typography><strong>Email:</strong> {erp.email || "N/A"}</Typography></Grid>
            
            <Grid item xs={12}><Divider sx={{ mt: 2 }}><strong>Father Details</strong></Divider></Grid>
            <Grid item xs={6}><Typography><strong>Father Name:</strong> {erp.fatherName || "N/A"}</Typography></Grid>
            <Grid item xs={6}><Typography><strong>Father Phone:</strong> {erp.fatherPhone || "N/A"}</Typography></Grid>
            <Grid item xs={6}><Typography><strong>Father Occupation:</strong> {erp.fatherOccupation || "N/A"}</Typography></Grid>
            
            <Grid item xs={12}><Divider sx={{ mt: 2 }}><strong>Mother Details</strong></Divider></Grid>
            <Grid item xs={6}><Typography><strong>Mother Name:</strong> {erp.motherName || "N/A"}</Typography></Grid>
            <Grid item xs={6}><Typography><strong>Mother Phone:</strong> {erp.motherPhone || "N/A"}</Typography></Grid>
            <Grid item xs={6}><Typography><strong>Mother Occupation:</strong> {erp.motherOccupation || "N/A"}</Typography></Grid>
            
            <Grid item xs={12}><Divider sx={{ mt: 2 }}><strong>Accommodation</strong></Divider></Grid>
            <Grid item xs={6}><Typography><strong>Type:</strong> {erp.accommodationType === "day_scholar" ? "Day Scholar" : "Residential"}</Typography></Grid>
            {erp.accommodationType === "day_scholar" && (
              <Grid item xs={6}><Typography><strong>From:</strong> {erp.whereFrom || "N/A"}</Typography></Grid>
            )}
            {erp.accommodationType === "residential" && (
              <Grid item xs={12}><Typography><strong>Address:</strong> {erp.residentialAddress || "N/A"}</Typography></Grid>
            )}
            
            <Grid item xs={12}><Divider sx={{ mt: 2 }}><strong>Education Background</strong></Divider></Grid>
            <Grid item xs={6}><Typography><strong>Intermediate %:</strong> {erp.intermediatePercentage || "N/A"}</Typography></Grid>
            <Grid item xs={6}><Typography><strong>Board:</strong> {erp.intermediateBoard || "N/A"}</Typography></Grid>
            
            <Grid item xs={12}><Divider sx={{ mt: 2 }}><strong>Scholarship</strong></Divider></Grid>
            <Grid item xs={6}><Typography><strong>Scholarship:</strong> {erp.scholarshipAvailed ? "Yes" : "No"}</Typography></Grid>
            {erp.scholarshipAvailed && (
              <>
                <Grid item xs={6}><Typography><strong>Name:</strong> {erp.scholarshipName}</Typography></Grid>
                <Grid item xs={6}><Typography><strong>Amount:</strong> {erp.scholarshipAmount || "N/A"}</Typography></Grid>
              </>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Academic Details */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Academic Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ p: 2, mb: 2, bgcolor: "primary.light", color: "white" }}>
            <Typography variant="subtitle1" fontWeight={600}>
              📚 Current: Semester {erp.currentSemester} | Overall CGPA: {erp.overallCGPA || "N/A"}
            </Typography>
            <Typography variant="body2">
              Total Semesters Completed: {erp.semesters?.length || 0}
            </Typography>
          </Paper>

          {erp.semesters && erp.semesters.length > 0 ? (
            erp.semesters.map((sem, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  📖 Semester {sem.semesterName}
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Chip label={`SGPA: ${sem.sgpa || "N/A"}`} color="success" />
                  </Grid>
                  <Grid item xs={6}>
                    <Chip label={`Courses: ${sem.courses?.length || 0}`} color="info" />
                  </Grid>
                </Grid>

                {sem.courses && sem.courses.length > 0 && (
                  <>
                    <Divider sx={{ my: 1 }}><strong>Course-wise Details</strong></Divider>
                    <Table size="small" sx={{ bgcolor: "white" }}>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>#</strong></TableCell>
                          <TableCell><strong>Course Name</strong></TableCell>
                          <TableCell align="center"><strong>GPA</strong></TableCell>
                          <TableCell align="center"><strong>Grade</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sem.courses.map((course, courseIdx) => (
                          <TableRow key={courseIdx}>
                            <TableCell>{courseIdx + 1}</TableCell>
                            <TableCell>{course.courseName || "N/A"}</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={course.gpa || "N/A"} 
                                size="small"
                                color={course.gpa >= 9 ? "success" : course.gpa >= 7 ? "primary" : "default"}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={course.grade || "O"} 
                                size="small"
                                color={
                                  course.grade === "O" ? "success" : 
                                  course.grade === "S" ? "primary" : 
                                  course.grade === "I" ? "warning" : 
                                  course.grade === "R" ? "error" : "default"
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: "right" }}>
                      Average Course GPA: {sem.sgpa || "N/A"}
                    </Typography>
                  </>
                )}
              </Paper>
            ))
          ) : (
            <Typography color="text.secondary">No semester data</Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Projects */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Projects ({erp.projects?.length || 0})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {erp.projects && erp.projects.length > 0 ? (
            erp.projects.map((proj, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 1, bgcolor: "grey.50" }}>
                <Typography variant="subtitle1"><strong>{proj.title}</strong></Typography>
                <Typography variant="body2">{proj.description}</Typography>
                {proj.technologies && <Typography variant="caption">Tech: {proj.technologies.join(", ")}</Typography>}
              </Paper>
            ))
          ) : (
            <Typography color="text.secondary">No projects</Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Internships */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Internships ({erp.internships?.length || 0})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {erp.internships && erp.internships.length > 0 ? (
            erp.internships.map((intern, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 1, bgcolor: "grey.50" }}>
                <Typography variant="subtitle1"><strong>{intern.company}</strong> - {intern.role}</Typography>
                <Typography variant="body2">{intern.duration}</Typography>
                {intern.description && <Typography variant="caption">{intern.description}</Typography>}
              </Paper>
            ))
          ) : (
            <Typography color="text.secondary">No internships</Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Placements */}
      {erp.placements && erp.placements.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Placements ({erp.placements.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {erp.placements.map((placement, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 1, bgcolor: "success.light" }}>
                <Typography variant="subtitle1"><strong>{placement.company}</strong></Typography>
                <Typography>Package: {placement.package}</Typography>
                <Typography>Role: {placement.role}</Typography>
              </Paper>
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Research Works */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Research Works ({erp.researchWorks?.length || 0})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {erp.researchWorks && erp.researchWorks.length > 0 ? (
            erp.researchWorks.map((research, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 1, bgcolor: "info.light" }}>
                <Typography variant="subtitle1"><strong>{research.title}</strong></Typography>
                <Typography variant="body2">{research.description}</Typography>
                <Typography variant="caption" display="block">
                  <strong>Domain:</strong> {research.domain || "N/A"}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Publication Status:</strong> {research.publicationStatus || "N/A"}
                </Typography>
                {research.guideName && (
                  <Typography variant="caption" display="block">
                    <strong>Guide:</strong> {research.guideName}
                  </Typography>
                )}
                {research.journalName && (
                  <Typography variant="caption" display="block">
                    <strong>Journal:</strong> {research.journalName}
                  </Typography>
                )}
              </Paper>
            ))
          ) : (
            <Typography color="text.secondary">No research works</Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
