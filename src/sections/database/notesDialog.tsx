import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Game } from "@/types/game";

interface NotesDialogProps {
  open: boolean;
  onClose: () => void;
  game: Game;
  onSave: (notes: string) => void;
}

export default function NotesDialog({ open, onClose, game, onSave }: NotesDialogProps) {
  const [notes, setNotes] = useState(game.notes || "");

  useEffect(() => {
    setNotes(game.notes || "");
  }, [game.notes]);

  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Game Notes - {game.white.name} vs {game.black.name}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Notes"
          fullWidth
          multiline
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your notes about this game..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
} 