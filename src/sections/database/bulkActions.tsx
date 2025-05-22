import React from "react";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { Game } from "@/types/game";
import { useState } from "react";
import TagsDialog from "./tagsDialog";
import FolderDialog from "./folderDialog";

interface BulkActionsProps {
  selectedGames: Game[];
  onBulkDelete: (gameIds: number[]) => Promise<void>;
  onBulkTag: (gameIds: number[], tags: string[]) => Promise<void>;
  onBulkMoveToFolder: (gameIds: number[], folderId: number) => Promise<void>;
}

export default function BulkActions({
  selectedGames,
  onBulkDelete,
  onBulkTag,
  onBulkMoveToFolder,
}: BulkActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleBulkDelete = async () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedGames.length} game${selectedGames.length !== 1 ? "s" : ""}?`,
      )
    ) {
      handleClose();
      await onBulkDelete(selectedGames.map((game) => game.id));
    }
  };

  const handleBulkTag = async (tags: string[]) => {
    await onBulkTag(
      selectedGames.map((game) => game.id),
      tags,
    );
    setIsTagsDialogOpen(false);
  };

  const handleMoveToFolder = async (folderId: number) => {
    await onBulkMoveToFolder(
      selectedGames.map((game) => game.id),
      folderId,
    );
  };

  if (selectedGames.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
      <Typography>
        {selectedGames.length} game{selectedGames.length !== 1 && "s"} selected
      </Typography>

      <Button variant="contained" onClick={handleClick} color="primary">
        Bulk Actions
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleClose();
            setIsTagsDialogOpen(true);
          }}
        >
          Add/Remove Tags
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            setIsFolderDialogOpen(true);
          }}
        >
          Move to Folder
        </MenuItem>
        <MenuItem onClick={handleBulkDelete} sx={{ color: "error.main" }}>
          Delete Selected Games
        </MenuItem>
      </Menu>

      <TagsDialog
        open={isTagsDialogOpen}
        onClose={() => setIsTagsDialogOpen(false)}
        onSave={handleBulkTag}
        game={selectedGames[0]} // Use first game's tags as reference
        isBulkEdit={true}
      />

      <FolderDialog
        open={isFolderDialogOpen}
        onClose={() => setIsFolderDialogOpen(false)}
        onMoveToFolder={handleMoveToFolder}
        selectedCount={selectedGames.length}
      />
    </Box>
  );
}
