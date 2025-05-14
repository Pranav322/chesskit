import React from "react";
import { ImportProgress as ImportProgressType } from "@/types/importedGame";
import { Icon } from "@iconify/react";
import {
  Box,
  Typography,
  LinearProgress,
  Grid,
  Paper,
  Avatar,
  Alert,
  AlertTitle,
} from "@mui/material";
import { DuplicateGameDialog } from "./DuplicateGameDialog";

export const ImportProgress: React.FC<{
  progress: ImportProgressType;
  onDuplicateAction?: (action: "skip" | "overwrite", applyToAll: boolean) => void;
}> = ({ progress, onDuplicateAction }) => {
  const percentage = progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  const getStatusColor = () => {
    switch (progress.status) {
      case "importing":
        return "warning.main";
      case "completed":
        return "success.main";
      case "failed":
        return "error.main";
      default:
        return "grey.600";
    }
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case "importing":
        return (
          <Icon
            icon="mdi:loading"
            style={{ 
              fontSize: "2rem",
              color: "warning.main",
              animation: "spin 1s linear infinite",
            }}
          />
        );
      case "completed":
        return (
          <Icon
            icon="mdi:check-circle"
            style={{ fontSize: "2rem", color: "success.main" }}
          />
        );
      case "failed":
        return (
          <Icon
            icon="mdi:alert-circle"
            style={{ fontSize: "2rem", color: "error.main" }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {getStatusIcon()}
          <Typography variant="h6" color="text.primary">
            {progress.status === "importing" && "Importing games..."}
            {progress.status === "completed" && "Import completed"}
            {progress.status === "failed" && "Import failed"}
          </Typography>
        </Box>
        <Typography variant="h6" color={getStatusColor()}>
          {percentage}%
        </Typography>
      </Paper>
      
      <Box sx={{ width: "100%" }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={progress.status === "completed" ? "success" : "primary"}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 2,
            }}
          >
            <Box 
              sx={{ 
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Total
              </Typography>
              <Icon 
                icon="mdi:database"
                style={{ fontSize: "1.5rem", color: "text.secondary" }}
              />
            </Box>
            <Typography variant="h4" color="text.primary">
              {progress.total}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 2,
              borderColor: "success.light",
              borderWidth: 1,
              borderStyle: "solid",
            }}
          >
            <Box 
              sx={{ 
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body1" color="success.main">
                Imported
              </Typography>
              <Icon 
                icon="mdi:check-circle"
                style={{ fontSize: "1.5rem", color: "success.main" }}
              />
            </Box>
            <Typography variant="h4" color="success.main">
              {progress.completed}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 2,
              borderColor: "warning.light",
              borderWidth: 1,
              borderStyle: "solid",
            }}
          >
            <Box 
              sx={{ 
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body1" color="warning.main">
                Duplicates
              </Typography>
              <Icon 
                icon="mdi:content-copy"
                style={{ fontSize: "1.5rem", color: "warning.main" }}
              />
            </Box>
            <Typography variant="h4" color="warning.main">
              {progress.duplicates || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {progress.currentDuplicate && (
        <DuplicateGameDialog
          open={Boolean(progress.currentDuplicate)}
          gameId={progress.currentDuplicate.gameId}
          onClose={() => onDuplicateAction?.("skip", false)}
          onAction={onDuplicateAction}
        />
      )}

      {progress.status === "failed" && progress.error && (
        <Alert
          severity="error"
          icon={
            <Avatar sx={{ bgcolor: "error.main" }}>
              <Icon icon="mdi:alert-circle" />
            </Avatar>
          }
        >
          <AlertTitle>Import Failed</AlertTitle>
          {progress.error}
        </Alert>
      )}
    </Box>
  );
}; 