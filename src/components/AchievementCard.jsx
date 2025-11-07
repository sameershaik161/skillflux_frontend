import React from "react";
import { Card, CardContent, Typography, Chip, Box, Stack, CardActions, Button } from "@mui/material";
import { getFileUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axiosInstance";
import { toast } from "react-toastify";

export default function AchievementCard({ achievement, refresh, onDelete }) {
  const { user } = useAuth();

  const deleteAchievement = async () => {
    if (!window.confirm("Are you sure you want to delete this achievement?")) return;
    try {
      await axios.delete(`/achievements/${achievement._id}`);
      toast.success("Achievement deleted");
      if (refresh) refresh();
      if (onDelete) onDelete();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Error deleting achievement");
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600}>
          {achievement.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {achievement.description || "No description provided"}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip label={achievement.category} color="primary" size="small" />
          <Chip
            label={achievement.status.toUpperCase()}
            color={
              achievement.status === "approved"
                ? "success"
                : achievement.status === "rejected"
                ? "error"
                : "warning"
            }
            size="small"
          />
        </Stack>

        <Typography variant="body2" sx={{ mt: 1 }}>
          Level: <strong>{achievement.level}</strong>
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Date: {new Date(achievement.date).toLocaleDateString()}
        </Typography>

        {achievement.points > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }} color="primary">
            Points: <strong>{achievement.points}</strong>
          </Typography>
        )}

        {achievement.proofFiles?.length > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Proof:{" "}
            {achievement.proofFiles.map((file, idx) => (
              <a 
                key={idx}
                href={getFileUrl(file)} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ marginRight: '8px' }}
              >
                File {idx + 1}
              </a>
            ))}
          </Typography>
        )}
      </CardContent>

      {user?.role === "student" && (
        <CardActions>
          <Button size="small" color="error" onClick={deleteAchievement}>
            Delete
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
