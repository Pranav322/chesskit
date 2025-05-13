import { Grid2 as Grid, Typography, Box, IconButton, Tooltip } from "@mui/material";
import { Icon } from "@iconify/react";
import {
  DataGrid,
  GridColDef,
  GridLocaleText,
  GRID_DEFAULT_LOCALE_TEXT,
  GridActionsCellItem,
  GridRowId,
} from "@mui/x-data-grid";
import { useCallback, useMemo, useState } from "react";
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
} from "@/sections/database/databaseFilters";
import { useAtomValue, useAtom } from "jotai";
import { Color } from "@/types/enums";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import NotesDialog from "@/sections/database/notesDialog";
import { Game } from "@/types/game";

const gridLocaleText: GridLocaleText = {
  ...GRID_DEFAULT_LOCALE_TEXT,
  noRowsLabel: "No games found",
};

export default function GameDatabase() {
  const { games, deleteGame, updateGame } = useGameDatabase(true);
  const router = useRouter();
  const [showFavoritesOnly] = useAtom(showFavoritesOnlyAtom);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

  // Get filter values
  const platformFilter = useAtomValue(platformFilterAtom);
  const resultFilter = useAtomValue(resultFilterAtom);
  const colorFilter = useAtomValue(colorFilterAtom);
  const openingFilter = useAtomValue(openingFilterAtom);

  // Filter games based on selected filters
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Favorites filter
      if (showFavoritesOnly && !game.isFavorite) {
        return false;
      }

      // Platform filter
      if (platformFilter !== "all" && game.source !== platformFilter) {
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

      return true;
    });
  }, [games, platformFilter, resultFilter, colorFilter, openingFilter, showFavoritesOnly]);

  const handleDeleteGameRow = useCallback(
    (id: GridRowId) => async () => {
      if (typeof id !== "number") {
        throw new Error("Unable to remove game");
      }
      await deleteGame(id);
    },
    [deleteGame]
  );

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

      <Grid maxWidth="100%" minWidth="50px">
        <DataGrid
          aria-label="Games list"
          rows={filteredGames}
          columns={columns}
          disableColumnMenu
          hideFooter={true}
          localeText={gridLocaleText}
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
        <NotesDialog
          open={isNotesDialogOpen}
          onClose={() => setIsNotesDialogOpen(false)}
          game={selectedGame}
          onSave={handleSaveNotes}
        />
      )}
    </Box>
  );
}
