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
  Slider,
  Typography,
} from "@mui/material";
import { GameOrigin, Color } from "@/types/enums";
import { atom, useAtom } from "jotai";

// Filter atoms
export const platformFilterAtom = atom<GameOrigin | "all">("all");
export const resultFilterAtom = atom<string>("all");
export const colorFilterAtom = atom<Color | "all">("all");
export const openingFilterAtom = atom<string>("");
export const showFavoritesOnlyAtom = atom<boolean>(false);
export const eloRangeFilterAtom = atom<[number, number]>([0, 3000]);
export const customTagFilterAtom = atom<string>("");

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
  const [eloRange, setEloRange] = useAtom(eloRangeFilterAtom);
  const [customTagFilter, setCustomTagFilter] = useAtom(customTagFilterAtom);

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

  const handleEloRangeChange = (_: Event, newValue: number | number[]) => {
    setEloRange(newValue as [number, number]);
  };

  const handleCustomTagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTagFilter(event.target.value);
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

      <Grid xs={12} sx={{ px: 4, mt: 2 }}>
        <FormControl fullWidth>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
            ELO Range: {eloRange[0]} - {eloRange[1]}
          </Typography>
          <Slider
            value={eloRange}
            onChange={handleEloRangeChange}
            valueLabelDisplay="auto"
            min={0}
            max={3000}
            step={100}
            sx={{
              '& .MuiSlider-thumb': {
                width: 24,
                height: 24,
              },
              '& .MuiSlider-track': {
                height: 8
              },
              '& .MuiSlider-rail': {
                height: 8
              },
              '& .MuiSlider-valueLabel': {
                fontSize: '0.875rem',
                fontWeight: 'medium',
                padding: '0.5rem',
                backgroundColor: 'primary.main'
              }
            }}
            getAriaValueText={(value) => `${value} ELO`}
            marks={[
              { value: 0 },
              { value: 1000 },
              { value: 1500 },
              { value: 2000 },
              { value: 2500 },
              { value: 3000 }
            ]}
          />
        </FormControl>
      </Grid>

      <Grid xs={12}>
        <TextField
          fullWidth
          size="small"
          label="Search by Tags"
          value={customTagFilter}
          onChange={handleCustomTagChange}
          placeholder="Search by custom tags..."
        />
      </Grid>
    </Grid>
  );
} 