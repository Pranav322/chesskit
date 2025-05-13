import React, { useState } from 'react';
import { GameOrigin } from '@/types/enums';
import { GameImportOptions } from '@/types/importedGame';
import { Icon } from '@iconify/react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  SelectChangeEvent,
} from '@mui/material';

const gameCountOptions = [50, 100, 200, 500] as const;

const platformOptions = [
  {
    value: GameOrigin.Lichess,
    label: "Lichess",
    icon: "simple-icons:lichess"
  },
  {
    value: GameOrigin.ChessCom,
    label: "Chess.com",
    icon: "simple-icons:chess-dot-com"
  }
];

export const GameImportForm: React.FC<{
  onSubmit: (options: GameImportOptions) => void;
  isLoading?: boolean;
}> = ({ onSubmit, isLoading }) => {
  const [platform, setPlatform] = useState<GameOrigin>(GameOrigin.Lichess);
  const [count, setCount] = useState<typeof gameCountOptions[number]>(100);
  const [autoTag, setAutoTag] = useState(true);
  const [backgroundImport, setBackgroundImport] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      platform,
      count,
      autoTag,
      backgroundImport,
    });
  };

  const handlePlatformChange = (event: SelectChangeEvent) => {
    setPlatform(event.target.value as GameOrigin);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Select Chess Platform
        </Typography>
        <FormControl fullWidth>
          <Select
            value={platform}
            onChange={handlePlatformChange}
            disabled={isLoading}
            sx={{
              "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 1.5
              }
            }}
          >
            {platformOptions.map((option) => (
              <MenuItem 
                key={option.value} 
                value={option.value}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  py: 1.5
                }}
              >
                <Icon 
                  icon={option.icon} 
                  style={{ 
                    fontSize: "32px",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }} 
                />
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Number of Games to Import
        </Typography>
        <FormControl fullWidth>
          <Select
            value={count.toString()}
            onChange={(e) => setCount(Number(e.target.value))}
            disabled={isLoading}
          >
            {gameCountOptions.map((option) => (
              <MenuItem key={option} value={option}>
                Last {option} Games
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ bgcolor: "background.paper", p: 2, borderRadius: 1 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={autoTag}
              onChange={(e) => setAutoTag(e.target.checked)}
              disabled={isLoading}
              color="primary"
            />
          }
          label="Auto-tag games (opening, date, platform)"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={backgroundImport}
              onChange={(e) => setBackgroundImport(e.target.checked)}
              disabled={isLoading}
              color="primary"
            />
          }
          label="Import in background"
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} /> : <Icon icon="mdi:cloud-download" />}
        sx={{ py: 1.5 }}
      >
        {isLoading ? "Importing Games..." : "Import Games"}
      </Button>
    </Box>
  );
}; 