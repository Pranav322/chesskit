import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Avatar,
  Paper,
  Divider,
} from "@mui/material";
import { useState } from "react";
import { PageTitle } from "@/components/pageTitle";
import GameInsightsButton from "@/components/GameInsights/GameInsightsButton";

export default function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await user?.updateProfile({
        displayName: displayName,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <ProtectedRoute>
      <Container component="main" maxWidth="sm">
        <PageTitle title="Profile - ChessEasy" />
        <Paper
          elevation={3}
          sx={{
            mt: 8,
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              bgcolor: "primary.main",
              fontSize: "2.5rem",
            }}
          >
            {user?.email?.[0].toUpperCase()}
          </Avatar>
          <Typography component="h1" variant="h5" gutterBottom>
            Profile
          </Typography>
          <Box sx={{ mt: 2, width: "100%" }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Email
            </Typography>
            <Typography variant="body1" gutterBottom>
              {user?.email}
            </Typography>

            <Box component="form" onSubmit={handleUpdateProfile} sx={{ mt: 3 }}>
              {isEditing ? (
                <>
                  <TextField
                    fullWidth
                    label="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button type="submit" variant="contained" color="primary">
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    gutterBottom
                  >
                    Display Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {displayName || "Not set"}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setIsEditing(true)}
                    sx={{ mt: 1 }}
                  >
                    Edit Profile
                  </Button>
                </>
              )}
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>
              Game Analysis
            </Typography>
            <Box sx={{ mt: 2 }}>
              <GameInsightsButton userId={user?.uid || ""} />
            </Box>
          </Box>
        </Paper>
      </Container>
    </ProtectedRoute>
  );
}
