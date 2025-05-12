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
} from "@mui/material";
import { useState } from "react";
import { PageTitle } from "@/components/pageTitle";

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
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Display Name
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  sx={{ mb: 2 }}
                />
              ) : (
                <Typography variant="body1" gutterBottom>
                  {user?.displayName || "Not set"}
                </Typography>
              )}

              {isEditing ? (
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{ flex: 1 }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(user?.displayName || "");
                    }}
                    sx={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(true)}
                  sx={{ mt: 2 }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </ProtectedRoute>
  );
} 