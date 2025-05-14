import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import { Icon } from "@iconify/react";

export interface DuplicateGameDialogProps {
  open: boolean;
  gameId: string;
  onClose: () => void;
  onAction: (action: "skip" | "overwrite", applyToAll: boolean) => void;
}

export const DuplicateGameDialog: React.FC<DuplicateGameDialogProps> = ({
  open,
  gameId,
  onClose,
  onAction,
}) => {
  const [applyToAll, setApplyToAll] = React.useState(false);

  const handleAction = (action: "skip" | "overwrite") => {
    onAction(action, applyToAll);
    setApplyToAll(false); // Reset for next time
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Icon icon="mdi:content-copy" style={{ color: "warning.main", fontSize: "1.5rem" }} />
          Duplicate Game Found
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body1">
            A game with the same ID already exists in your database:
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontFamily: "monospace" }}>
            {gameId}
          </Typography>
        </Alert>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          What would you like to do with this duplicate game?
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
            />
          }
          label="Apply this action to all future duplicates"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => handleAction("skip")}
          startIcon={<Icon icon="mdi:skip-next" />}
        >
          Skip
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => handleAction("overwrite")}
          startIcon={<Icon icon="mdi:content-save" />}
        >
          Overwrite
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 