import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { Folder } from "@/types/folder";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useGameDatabase } from "@/hooks/useGameDatabase";

interface Props {
  open: boolean;
  onClose: () => void;
  onMoveToFolder?: (folderId: number) => Promise<void>;
  selectedCount?: number;
}

export default function FolderDialog({
  open,
  onClose,
  onMoveToFolder,
  selectedCount,
}: Props) {
  const { folders, createFolder, updateFolder, deleteFolder } =
    useGameDatabase(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder({
        name: newFolderName.trim(),
        description: "",
      });
      setNewFolderName("");
    }
  };

  const handleUpdateFolder = async () => {
    if (editingFolder && editName.trim()) {
      await updateFolder(editingFolder.id, {
        name: editName.trim(),
      });
      setEditingFolder(null);
      setEditName("");
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    if (
      confirm(`Are you sure you want to delete the folder "${folder.name}"?`)
    ) {
      await deleteFolder(folder.id);
    }
  };

  const handleMoveToFolder = async (folder: Folder) => {
    if (onMoveToFolder) {
      await onMoveToFolder(folder.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {onMoveToFolder
          ? `Move ${selectedCount} Game${selectedCount !== 1 ? "s" : ""} to Folder`
          : "Manage Folders"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Create new folder"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreateFolder();
              }
            }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              ),
            }}
          />
        </Box>

        <Divider />

        <List>
          {folders.map((folder) => (
            <ListItem
              key={folder.id}
              onClick={() => onMoveToFolder && handleMoveToFolder(folder)}
              sx={
                onMoveToFolder
                  ? {
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                    }
                  : undefined
              }
            >
              {editingFolder?.id === folder.id ? (
                <TextField
                  fullWidth
                  size="small"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateFolder();
                    }
                  }}
                  autoFocus
                />
              ) : (
                <ListItemText
                  primary={folder.name}
                  secondary={`Created ${folder.createdAt.toLocaleDateString()}`}
                />
              )}

              {!onMoveToFolder && (
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => {
                      setEditingFolder(folder);
                      setEditName(folder.name);
                    }}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteFolder(folder)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>

        {folders.length === 0 && (
          <Typography
            color="text.secondary"
            sx={{ textAlign: "center", mt: 2 }}
          >
            No folders created yet
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{onMoveToFolder ? "Cancel" : "Close"}</Button>
      </DialogActions>
    </Dialog>
  );
}
