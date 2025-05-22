import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import { Game } from "@/types/game";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  game: Game;
  onSave: (tags: string[]) => void;
  isBulkEdit?: boolean;
}

export default function TagsDialog({
  open,
  onClose,
  game,
  onSave,
  isBulkEdit,
}: Props) {
  const [tags, setTags] = useState<string[]>(game.tags || []);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const handleSave = () => {
    onSave(tags);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isBulkEdit ? "Bulk Edit Tags" : "Manage Tags"}
        {isBulkEdit && (
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            These tags will be applied to all selected games
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Add new tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddTag();
              }
            }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
                color="primary"
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          {isBulkEdit ? "Apply to All Selected" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
