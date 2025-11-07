import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Box, Grid, Card, CardContent } from "@mui/material";
import { toast } from "react-toastify";

export default function Analytics() {
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

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Analytics Dashboard</Typography>

      {/* Achievement Statistics */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: "success.light", color: "white" }}>
            <CardContent>
              <Typography variant="h6">Approved</Typography>
              <Typography variant="h3">{data.counts.approved}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: "warning.light", color: "white" }}>
            <CardContent>
              <Typography variant="h6">Pending</Typography>
              <Typography variant="h3">{data.counts.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: "error.light", color: "white" }}>
            <CardContent>
              <Typography variant="h6">Rejected</Typography>
              <Typography variant="h3">{data.counts.rejected}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Students Leaderboard */}
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>Top Students by Points</Typography>
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
              {data.topStudents.map((s, idx) => (
                <TableRow key={s._id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.rollNumber}</TableCell>
                  <TableCell>{s.section}</TableCell>
                  <TableCell align="right">
                    <Typography color="primary" fontWeight={600}>
                      {s.totalPoints}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            No students with points yet
          </Typography>
        )}
      </Paper>
    </Container>
  );
}
