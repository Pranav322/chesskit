import { NextPage } from "next";
import { GameImportContainer } from "@/components/GameImport/GameImportContainer";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { PageTitle } from "@/components/pageTitle";
import {
  Box,
 
  Typography,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material";

const ImportGamesPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <Box sx={{ height: "100%", width: "100%", p: 2 }}>
      <PageTitle title="Import Chess Games" />

      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Grid item xs={12} sx={{ textAlign: "center" }}>
          <Box sx={{ display: "inline-flex", p: 2, mb: 2 }}>
            <Icon
              icon="mdi:database-import"
              style={{ fontSize: "40px", color: "#ed8936" }}
            />
          </Box>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
            Import Your Chess Games
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Import your games from Lichess or Chess.com to analyze and improve
            your play
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ maxWidth: "lg", mx: "auto" }}>
        <Paper elevation={0} sx={{ borderRadius: 3 }}>
          <GameImportContainer />
        </Paper>
      </Box>
    </Box>
  );
};

export default ImportGamesPage;
