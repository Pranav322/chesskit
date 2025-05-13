import {
  FormControl,
  Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  SelectChangeEvent,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { GameOrigin, Color } from "@/types/enums";
import { atom, useAtom } from "jotai";

// Filter atoms
export const platformFilterAtom = atom<GameOrigin | "all">("all");
export const resultFilterAtom = atom<string>("all");
export const colorFilterAtom = atom<Color | "all">("all");
export const openingFilterAtom = atom<string>("");
export const showFavoritesOnlyAtom = atom<boolean>(false);

const results = [
  { value: "all", label: "All Results" },
  { value: "1-0", label: "White Wins" },
  { value: "0-1", label: "Black Wins" },
  { value: "1/2-1/2", label: "Draw" },
];

export default function DatabaseFilters() {
  const [platformFilter, setPlatformFilter] = useAtom(platformFilterAtom);
  const [resultFilter, setResultFilter] = useAtom(resultFilterAtom);
  const [colorFilter, setColorFilter] = useAtom(colorFilterAtom);
  const [openingFilter, setOpeningFilter] = useAtom(openingFilterAtom);
  const [showFavoritesOnly, setShowFavoritesOnly] = useAtom(showFavoritesOnlyAtom);

  const handlePlatformChange = (event: SelectChangeEvent) => {
    setPlatformFilter(event.target.value as GameOrigin | "all");
  };

  const handleResultChange = (event: SelectChangeEvent) => {
    setResultFilter(event.target.value);
  };

  const handleColorChange = (event: SelectChangeEvent) => {
    setColorFilter(event.target.value as Color | "all");
  };

  const handleOpeningChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOpeningFilter(event.target.value);
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid xs={2}>
        <FormControlLabel
          control={
            <Switch
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
              color="primary"
            />
          }
          label="Favorites Only"
        />
      </Grid>

      <Grid xs={2.5}>
        <FormControl fullWidth size="small">
          <InputLabel>Platform</InputLabel>
          <Select
            value={platformFilter}
            label="Platform"
            onChange={handlePlatformChange}
          >
            <MenuItem value="all">All Platforms</MenuItem>
            <MenuItem value={GameOrigin.ChessCom}>Chess.com</MenuItem>
            <MenuItem value={GameOrigin.Lichess}>Lichess</MenuItem>
            <MenuItem value={GameOrigin.Pgn}>PGN Import</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid xs={2.5}>
        <FormControl fullWidth size="small">
          <InputLabel>Result</InputLabel>
          <Select value={resultFilter} label="Result" onChange={handleResultChange}>
            {results.map((result) => (
              <MenuItem key={result.value} value={result.value}>
                {result.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid xs={2.5}>
        <FormControl fullWidth size="small">
          <InputLabel>Color</InputLabel>
          <Select value={colorFilter} label="Color" onChange={handleColorChange}>
            <MenuItem value="all">All Colors</MenuItem>
            <MenuItem value={Color.White}>White</MenuItem>
            <MenuItem value={Color.Black}>Black</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid xs={2.5}>
        <TextField
          fullWidth
          size="small"
          label="Opening"
          value={openingFilter}
          onChange={handleOpeningChange}
          placeholder="Search opening..."
        />
      </Grid>
    </Grid>
  );
} 