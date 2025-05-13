import React, { useState } from 'react';
import { GameImportForm } from './GameImportForm';
import { ImportProgress } from './ImportProgress';
import { GameImportOptions, ImportProgress as ImportProgressType } from '@/types/importedGame';
import { useAuth } from '@/contexts/AuthContext';
import { GameImportService } from '@/lib/services/gameImportService';
import { Icon } from '@iconify/react';
import { Box, Typography, TextField, InputAdornment, Paper, Grid } from '@mui/material';

const initialProgress: ImportProgressType = {
  total: 0,
  completed: 0,
  failed: 0,
  status: 'idle',
};

export const GameImportContainer: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ImportProgressType>(initialProgress);
  const [username, setUsername] = useState('');
  const importService = new GameImportService();

  const handleImport = async (options: GameImportOptions) => {
    if (!user || !username) {
      setProgress({
        ...initialProgress,
        status: 'failed',
        error: !user ? 'Please log in to import games' : 'Please enter a username',
      });
      return;
    }

    try {
      await importService.importGames(
        user.uid,
        username,
        options,
        (newProgress) => {
          if (typeof newProgress === 'function') {
            setProgress(prev => newProgress(prev));
          } else {
            setProgress(newProgress);
          }
        }
      );
    } catch (error) {
      setProgress(prev => ({
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Icon icon="mdi:chess" style={{ fontSize: '28px', color: '#ed8936', marginRight: '12px' }} />
              <Typography variant="h6">
                Platform Details
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography 
                  component="label" 
                  htmlFor="username" 
                  variant="subtitle2"
                  sx={{ display: 'block', mb: 1 }}
                >
                  Chess Platform Username
                </Typography>
                <TextField
                  fullWidth
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={progress.status === 'importing'}
                  size="medium"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Icon icon="mdi:account" style={{ fontSize: '20px' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
              <GameImportForm
                onSubmit={handleImport}
                isLoading={progress.status === 'importing'}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Icon icon="mdi:progress-check" style={{ fontSize: '28px', color: '#ed8936', marginRight: '12px' }} />
              <Typography variant="h6">
                Import Progress
              </Typography>
            </Box>
            {progress.status !== 'idle' && (
              <Box sx={{ mt: 2 }}>
                <ImportProgress progress={progress} />
              </Box>
            )}
            {progress.status === 'idle' && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Icon icon="mdi:information" style={{ fontSize: '40px', marginBottom: '16px' }} />
                <Typography color="text.secondary">
                  Enter your username and configure import settings to begin
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 