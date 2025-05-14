import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Typography,
  Box,
} from '@mui/material';
import { GameOrigin } from '@/types/enums';
import { ImportProgress } from '@/types/importedGame';
import { GameImportService, ImportGameResult } from '@/lib/services/gameImportService';
import DuplicateGameDialog from './DuplicateGameDialog';

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export default function ImportGamesDialog({ open, onClose, userId }: Props) {
  const [platform, setPlatform] = useState<GameOrigin>(GameOrigin.Lichess);
  const [username, setUsername] = useState('');
  const [count, setCount] = useState(10);
  const [autoTag, setAutoTag] = useState(true);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [duplicateGame, setDuplicateGame] = useState<ImportGameResult | null>(null);

  const importService = new GameImportService();

  const handleImport = async () => {
    setImporting(true);
    setProgress(null);

    try {
      await importService.importGames(
        userId,
        username,
        {
          platform,
          count,
          autoTag,
          onDuplicateFound: async (result) => {
            setDuplicateGame(result);
            return new Promise((resolve) => {
              const handleResolution = (resolution: 'skip' | 'overwrite' | 'new') => {
                setDuplicateGame(null);
                resolve(resolution);
              };

              // The DuplicateGameDialog will call these handlers
              window.duplicateGameHandlers = {
                onSkip: () => handleResolution('skip'),
                onOverwrite: () => handleResolution('overwrite'),
                onImportAsNew: () => handleResolution('new'),
              };
            });
          },
        },
        setProgress
      );
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (!importing) {
      setProgress(null);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Import Games</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Platform</InputLabel>
              <Select
                value={platform}
                label="Platform"
                onChange={(e) => setPlatform(e.target.value as GameOrigin)}
                disabled={importing}
              >
                <MenuItem value={GameOrigin.Lichess}>Lichess</MenuItem>
                <MenuItem value={GameOrigin.ChessCom}>Chess.com</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={importing}
              fullWidth
            />

            <TextField
              label="Number of Games"
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              disabled={importing}
              fullWidth
              inputProps={{ min: 1, max: 100 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={autoTag}
                  onChange={(e) => setAutoTag(e.target.checked)}
                  disabled={importing}
                />
              }
              label="Auto-tag games"
            />

            {progress && (
              <Box sx={{ width: '100%' }}>
                <LinearProgress
                  variant="determinate"
                  value={(progress.completed / progress.total) * 100}
                />
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  {progress.completed} / {progress.total} games imported
                  {progress.failed > 0 && ` (${progress.failed} failed)`}
                </Typography>
                {progress.error && (
                  <Typography variant="body2" color="error" align="center">
                    {progress.error}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={importing}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || !username || count < 1}
            variant="contained"
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      {duplicateGame && (
        <DuplicateGameDialog
          open={true}
          onClose={() => window.duplicateGameHandlers?.onSkip()}
          newGame={duplicateGame.gameData}
          existingGame={duplicateGame.duplicateCheck?.existingGame}
          duplicateResult={duplicateGame.duplicateCheck!}
          onSkip={() => window.duplicateGameHandlers?.onSkip()}
          onOverwrite={() => window.duplicateGameHandlers?.onOverwrite()}
          onImportAsNew={() => window.duplicateGameHandlers?.onImportAsNew()}
        />
      )}
    </>
  );
} 