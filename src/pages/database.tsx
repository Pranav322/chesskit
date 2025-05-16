import { Grid2 as Grid, Typography, Box, IconButton, Tooltip, Chip } from "@mui/material";
import { Icon } from "@iconify/react";
import {
  DataGrid,
  GridColDef,
  GridLocaleText,
  GRID_DEFAULT_LOCALE_TEXT,
  GridActionsCellItem,
  GridRowId,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { useCallback, useMemo, useState, useEffect } from "react";
import { blue, red, yellow } from "@mui/material/colors";
import LoadGameButton from "@/sections/loadGame/loadGameButton";
import { useGameDatabase } from "@/hooks/useGameDatabase";
import { useRouter } from "next/router";
import { PageTitle } from "@/components/pageTitle";
import DatabaseFilters, {
  platformFilterAtom,
  resultFilterAtom,
  colorFilterAtom,
  openingFilterAtom,
  showFavoritesOnlyAtom,
  eloRangeFilterAtom,
  customTagFilterAtom,
  folderFilterAtom,
} from "@/sections/database/databaseFilters";
import { useAtomValue, useAtom } from "jotai";
import { Color } from "@/types/enums";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import NotesDialog from "@/sections/database/notesDialog";
import { Game } from "@/types/game";
import TagsDialog from "@/sections/database/tagsDialog";
import BulkActions from "@/sections/database/bulkActions";

const gridLocaleText: GridLocaleText = {
  ...GRID_DEFAULT_LOCALE_TEXT,
  noRowsLabel: "No games found",
};

export default function GameDatabase() {
  const { games, deleteGame, updateGame, moveGamesToFolder, getFolderGames } = useGameDatabase(true);
  const router = useRouter();
  const [showFavoritesOnly] = useAtom(showFavoritesOnlyAtom);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

  // Get filter values
  const platformFilter = useAtomValue(platformFilterAtom);
  const resultFilter = useAtomValue(resultFilterAtom);
  const colorFilter = useAtomValue(colorFilterAtom);
  const openingFilter = useAtomValue(openingFilterAtom);
  const eloRangeFilter = useAtomValue(eloRangeFilterAtom);
  const customTagFilter = useAtomValue(customTagFilterAtom);
  const folderFilter = useAtomValue(folderFilterAtom);

  // Filter games based on selected filters
  useEffect(() => {
    const filterGames = async () => {
      let gamesInFolder = games;
      
      // Apply folder filter first
      if (folderFilter !== "all") {
        const folderGameIds = await getFolderGames(folderFilter);
        gamesInFolder = games.filter(game => folderGameIds.includes(game.id));
      }

      const filtered = gamesInFolder.filter((game) => {
        // Favorites filter
        if (showFavoritesOnly && !game.isFavorite) {
          return false;
        }

        // Platform filter
        if (platformFilter !== "all" && game.metadata?.platform !== platformFilter) {
          return false;
        }

        // Result filter
        if (resultFilter !== "all" && game.result !== resultFilter) {
          return false;
        }

        // Color filter
        if (colorFilter !== "all") {
          const username = localStorage.getItem("username") || "";
          const playingAsWhite = game.white.name === username;
          const playingAsBlack = game.black.name === username;

          if (colorFilter === Color.White && !playingAsWhite) {
            return false;
          }
          if (colorFilter === Color.Black && !playingAsBlack) {
            return false;
          }
        }

        // Opening filter
        if (openingFilter && !game.event?.toLowerCase().includes(openingFilter.toLowerCase())) {
          return false;
        }

        // ELO Range filter
        const whiteElo = game.white.rating || 0;
        const blackElo = game.black.rating || 0;
        const username = localStorage.getItem("username") || "";
        const playerElo = game.white.name === username ? whiteElo : blackElo;
        
        if (playerElo < eloRangeFilter[0] || playerElo > eloRangeFilter[1]) {
          return false;
        }

        // Custom Tags filter
        if (customTagFilter && customTagFilter.trim() !== "") {
          const searchTerm = customTagFilter.toLowerCase().trim();
          if (!game.tags || !game.tags.some(tag => 
            tag.toLowerCase().includes(searchTerm)
          )) {
            return false;
          }
        }

        return true;
      });

      setFilteredGames(filtered);
    };

    filterGames();
  }, [games, platformFilter, resultFilter, colorFilter, openingFilter, showFavoritesOnly, eloRangeFilter, customTagFilter, folderFilter, getFolderGames]);

  const handleDeleteGameRow = useCallback(
    (id: GridRowId) => async () => {
      if (typeof id !== "number") {
        throw new Error("Unable to remove game");
      }
      await deleteGame(id);
    },
    [deleteGame]
  );

  const handleBulkDelete = async (gameIds: number[]) => {
    for (const id of gameIds) {
      await deleteGame(id);
    }
    setSelectedRows([]);
  };

  const handleBulkTag = async (gameIds: number[], tags: string[]) => {
    for (const id of gameIds) {
      const game = games.find(g => g.id === id);
      if (game) {
        await updateGame(id, { ...game, tags });
      }
    }
  };

  const handleCopyGameRow = useCallback(
    (id: GridRowId) => async () => {
      if (typeof id !== "number") {
        throw new Error("Unable to copy game");
      }
      await navigator.clipboard.writeText(games[id - 1].pgn);
    },
    [games]
  );

  const handleToggleFavorite = useCallback(
    (game: Game) => async () => {
      await updateGame(game.id, { ...game, isFavorite: !game.isFavorite });
    },
    [games, updateGame]
  );

  const handleSaveNotes = (notes: string) => {
    if (selectedGame) {
      updateGame(selectedGame.id, {
        ...selectedGame,
        notes,
      });
    }
  };

  const handleUpdateTags = useCallback(
    async (game: Game, newTags: string[]) => {
      await updateGame(game.id, { ...game, tags: newTags });
    },
    [updateGame]
  );

  const handleBulkMoveToFolder = async (gameIds: number[], folderId: number) => {
    await moveGamesToFolder(gameIds, folderId);
    setSelectedRows([]);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "favorite",
        headerName: "★",
        width: 50,
        type: "actions",
        getActions: ({ id, row }) => [
          <GridActionsCellItem
            icon={
              <IconButton
                onClick={handleToggleFavorite(row as Game)}
                sx={{ color: row.isFavorite ? yellow[700] : "inherit" }}
              >
                {row.isFavorite ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            }
            label={row.isFavorite ? "Remove from favorites" : "Add to favorites"}
            color="inherit"
            key={`${id}-favorite-button`}
          />,
        ],
      },
      {
        field: "notes",
        headerName: "",
        width: 50,
        renderCell: (params: any) => (
          <Tooltip title={params.row.notes ? "Edit notes" : "Add notes"}>
            <IconButton
              onClick={() => {
                setSelectedGame(params.row as Game);
                setIsNotesDialogOpen(true);
              }}
              color={params.row.notes ? "primary" : "default"}
            >
              <NoteAltIcon />
            </IconButton>
          </Tooltip>
        ),
      },
      {
        field: "event",
        headerName: "Event",
        width: 150,
      },
      {
        field: "site",
        headerName: "Site",
        width: 150,
      },
      {
        field: "date",
        headerName: "Date",
        width: 150,
      },
      {
        field: "round",
        headerName: "Round",
        headerAlign: "center",
        align: "center",
        width: 150,
      },
      {
        field: "whiteLabel",
        headerName: "White",
        width: 200,
        headerAlign: "center",
        align: "center",
        valueGetter: (_, row) =>
          `${row.white.name ?? "Unknown"} (${row.white.rating ?? "?"})`,
      },
      {
        field: "result",
        headerName: "Result",
        headerAlign: "center",
        align: "center",
        width: 100,
      },
      {
        field: "blackLabel",
        headerName: "Black",
        width: 200,
        headerAlign: "center",
        align: "center",
        valueGetter: (_, row) =>
          `${row.black.name ?? "Unknown"} (${row.black.rating ?? "?"})`,
      },
      {
        field: "eval",
        headerName: "Evaluation",
        type: "boolean",
        headerAlign: "center",
        align: "center",
        width: 100,
        valueGetter: (_, row) => !!row.eval,
      },
      {
        field: "openEvaluation",
        type: "actions",
        headerName: "Analyze",
        width: 100,
        cellClassName: "actions",
        getActions: ({ id }) => {
          return [
            <GridActionsCellItem
              icon={
                <Icon icon="streamline:magnifying-glass-solid" width="20px" />
              }
              label="Open Evaluation"
              onClick={() =>
                router.push({ pathname: "/", query: { gameId: id } })
              }
              color="inherit"
              key={`${id}-open-eval-button`}
            />,
          ];
        },
      },
      {
        field: "delete",
        type: "actions",
        headerName: "Delete",
        width: 100,
        cellClassName: "actions",
        getActions: ({ id }) => {
          return [
            <GridActionsCellItem
              icon={
                <Icon icon="mdi:delete-outline" color={red[400]} width="20px" />
              }
              label="Delete"
              onClick={handleDeleteGameRow(id)}
              color="inherit"
              key={`${id}-delete-button`}
            />,
          ];
        },
      },
      {
        field: "copy pgn",
        type: "actions",
        headerName: "Copy pgn",
        width: 100,
        cellClassName: "actions",
        getActions: ({ id }) => {
          return [
            <GridActionsCellItem
              icon={
                <Icon icon="ri:clipboard-line" color={blue[400]} width="20px" />
              }
              label="Copy pgn"
              onClick={handleCopyGameRow(id)}
              color="inherit"
              key={`${id}-copy-button`}
            />,
          ];
        },
      },
      {
        field: "tags",
        headerName: "Tags",
        width: 300,
        renderCell: (params: any) => {
          const game = params.row as Game;
          return (
            <Box 
              sx={{ 
                display: "flex", 
                gap: 0.5, 
                flexWrap: "wrap",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                py: 0.5,
                "&:hover": {
                  cursor: "pointer",
                  "& .add-tag": {
                    opacity: 1,
                  },
                  backgroundColor: "action.hover",
                  borderRadius: 1,
                },
              }}
              onClick={() => {
                setSelectedGame(game);
                setIsTagsDialogOpen(true);
              }}
            >
              {game.tags?.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  color="primary"
                  sx={{
                    maxWidth: 120,
                    fontSize: "0.75rem",
                    color: "white",
                    backgroundColor: "primary.main",
                    "& .MuiChip-label": {
                      color: "white",
                    },
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  }}
                />
              ))}
              <Chip
                icon={<Icon icon="mdi:tag-plus" />}
                label="Add Tag"
                size="small"
                className="add-tag"
                sx={{
                  opacity: game.tags?.length ? 0 : 1,
                  transition: "opacity 0.2s",
                  backgroundColor: "primary.main",
                  color: "white",
                  "& .MuiChip-icon": {
                    color: "white",
                  },
                  "&:hover": {
                    backgroundColor: "primary.dark",
                    opacity: 1,
                  },
                }}
              />
            </Box>
          );
        },
      },
    ],
    [handleDeleteGameRow, handleCopyGameRow, handleToggleFavorite, router]
  );

  return (
    <Box sx={{ height: "100%", width: "100%", p: 2 }}>
      <PageTitle title="Chesskit Game Database" />

      <Grid container justifyContent="center" alignItems="center" size={12}>
        <LoadGameButton />
      </Grid>

      <Grid container justifyContent="center" alignItems="center" size={12}>
        <Typography variant="subtitle2">
          You have {filteredGames.length} game{filteredGames.length !== 1 && "s"} in your
          database
        </Typography>
      </Grid>

      <Grid container justifyContent="center" alignItems="center" size={12} paddingX={4}>
        <DatabaseFilters />
      </Grid>

      <BulkActions
        selectedGames={selectedRows.map(id => games.find(g => g.id === id)).filter((g): g is Game => !!g)}
        onBulkDelete={handleBulkDelete}
        onBulkTag={handleBulkTag}
        onBulkMoveToFolder={handleBulkMoveToFolder}
      />

      <Grid maxWidth="100%" minWidth="50px">
        <DataGrid
          aria-label="Games list"
          rows={filteredGames}
          columns={columns}
          disableColumnMenu
          hideFooter={true}
          localeText={gridLocaleText}
          checkboxSelection
          onRowSelectionModelChange={(newSelection) => {
            setSelectedRows(newSelection);
          }}
          rowSelectionModel={selectedRows}
          initialState={{
            sorting: {
              sortModel: [
                {
                  field: "date",
                  sort: "desc",
                },
              ],
            },
          }}
        />
      </Grid>

      {selectedGame && (
        <>
          <NotesDialog
            open={isNotesDialogOpen}
            onClose={() => setIsNotesDialogOpen(false)}
            game={selectedGame}
            onSave={handleSaveNotes}
          />
          <TagsDialog
            open={isTagsDialogOpen}
            onClose={() => setIsTagsDialogOpen(false)}
            game={selectedGame}
            onSave={(tags) => handleUpdateTags(selectedGame, tags)}
          />
        </>
      )}
    </Box>
  );
}
