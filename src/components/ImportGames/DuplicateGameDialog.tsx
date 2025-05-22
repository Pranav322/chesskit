import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
} from "@mui/material";
import { ImportedGameData } from "@/types/database";
import { DuplicateCheckResult } from "@/lib/services/duplicateGameService";
import { formatDate } from "@/lib/utils/dateUtils";

interface Props {
  open: boolean;
  onClose: () => void;
  newGame: ImportedGameData;
  existingGame: ImportedGameData;
  duplicateResult: DuplicateCheckResult;
  onSkip: () => void;
  onOverwrite: () => void;
  onImportAsNew: () => void;
}

const GameDetails = ({ game }: { game: ImportedGameData }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="subtitle2" gutterBottom>
      {formatDate(game.metadata.date.toDate())}
    </Typography>
    <Typography>
      White: {game.metadata.white.name} (
      {game.metadata.white.rating || "Unrated"})
    </Typography>
    <Typography>
      Black: {game.metadata.black.name} (
      {game.metadata.black.rating || "Unrated"})
    </Typography>
    <Typography>
      Time Control: {game.metadata.timeControl || "Unknown"}
    </Typography>
    <Typography>Result: {game.metadata.result || "Unknown"}</Typography>
    <Typography>Opening: {game.metadata.opening || "Unknown"}</Typography>
  </Paper>
);

export default function DuplicateGameDialog({
  open,
  onClose,
  newGame,
  existingGame,
  duplicateResult,
  onSkip,
  onOverwrite,
  onImportAsNew,
}: Props) {
  const handleSkip = () => {
    onSkip();
    onClose();
  };

  const handleOverwrite = () => {
    onOverwrite();
    onClose();
  };

  const handleImportAsNew = () => {
    onImportAsNew();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Duplicate Game Detected
        {duplicateResult.matchReason === "similar" && (
          <Typography variant="subtitle2" color="text.secondary">
            Similarity Score:{" "}
            {Math.round(duplicateResult.similarityScore! * 100)}%
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          {duplicateResult.matchReason === "exact"
            ? "An exact match of this game was found in your database."
            : "A similar game was found in your database."}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                New Game
              </Typography>
              <GameDetails game={newGame} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Existing Game
              </Typography>
              <GameDetails game={existingGame} />
            </Grid>
          </Grid>
        </Box>

        <Typography sx={{ mt: 2 }}>How would you like to proceed?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSkip} color="primary">
          Skip
        </Button>
        <Button onClick={handleOverwrite} color="warning">
          Overwrite Existing
        </Button>
        <Button onClick={handleImportAsNew} color="primary" variant="contained">
          Import as New
        </Button>
      </DialogActions>
    </Dialog>
  );
}
