import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import { useEffect, useState } from 'react';
import { GameInsights, OpeningStats, PositionAnalysis, WeaknessAnalysis } from '@/types/insights';
import { generateGameInsights } from '@/lib/services/insightsService';
import { useGameDatabase } from '@/hooks/useGameDatabase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { generateInsightsPDF } from '@/lib/services/pdfService';
import DownloadIcon from '@mui/icons-material/Download';

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`insights-tabpanel-${index}`}
      aria-labelledby={`insights-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function OpeningStatsTable({ stats, title }: { stats: OpeningStats[]; title: string }) {
  if (!stats.length) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Opening</TableCell>
              <TableCell align="right">Games</TableCell>
              <TableCell align="right">Win %</TableCell>
              <TableCell align="right">W/D/L</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map((opening) => (
              <TableRow key={opening.name}>
                <TableCell component="th" scope="row">
                  {opening.name}
                </TableCell>
                <TableCell align="right">{opening.count}</TableCell>
                <TableCell align="right">{Math.round(opening.winRate)}%</TableCell>
                <TableCell align="right">
                  {opening.wins}/{opening.draws}/{opening.losses}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function AccuracySection({ accuracy }: { accuracy: GameInsights['accuracy'] }) {
  return (
    <Grid container spacing={3}>
      {/* Overall Accuracy */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Overall Accuracy</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4">{Math.round(accuracy.overall)}%</Typography>
            <Box sx={{ flexGrow: 1 }}>
              <LinearProgress
                variant="determinate"
                value={accuracy.overall}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Color-specific Accuracy */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>As White</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5">{Math.round(accuracy.asWhite)}%</Typography>
            <Box sx={{ flexGrow: 1 }}>
              <LinearProgress
                variant="determinate"
                value={accuracy.asWhite}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>As Black</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5">{Math.round(accuracy.asBlack)}%</Typography>
            <Box sx={{ flexGrow: 1 }}>
              <LinearProgress
                variant="determinate"
                value={accuracy.asBlack}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Phase Accuracy */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Accuracy by Game Phase</Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="subtitle1">Opening</Typography>
              <Typography variant="h6">{Math.round(accuracy.byPhase.opening)}%</Typography>
              <LinearProgress
                variant="determinate"
                value={accuracy.byPhase.opening}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle1">Middlegame</Typography>
              <Typography variant="h6">{Math.round(accuracy.byPhase.middlegame)}%</Typography>
              <LinearProgress
                variant="determinate"
                value={accuracy.byPhase.middlegame}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle1">Endgame</Typography>
              <Typography variant="h6">{Math.round(accuracy.byPhase.endgame)}%</Typography>
              <LinearProgress
                variant="determinate"
                value={accuracy.byPhase.endgame}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Time Control Accuracy */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Accuracy by Time Control</Typography>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Typography variant="subtitle1">Bullet</Typography>
              <Typography variant="h6">{Math.round(accuracy.byTimeControl.bullet)}%</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle1">Blitz</Typography>
              <Typography variant="h6">{Math.round(accuracy.byTimeControl.blitz)}%</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle1">Rapid</Typography>
              <Typography variant="h6">{Math.round(accuracy.byTimeControl.rapid)}%</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle1">Classical</Typography>
              <Typography variant="h6">{Math.round(accuracy.byTimeControl.classical)}%</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

function CriticalPositionsSection({ positions }: { positions: PositionAnalysis[] }) {
  if (!positions.length) return null;

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Move</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Accuracy</TableCell>
            <TableCell>Best Move</TableCell>
            <TableCell>Played Move</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {positions.map((pos, index) => (
            <TableRow key={index}>
              <TableCell>{pos.moveNumber}</TableCell>
              <TableCell>
                <Chip
                  label={pos.isBlunder ? "Blunder" : "Mistake"}
                  color={pos.isBlunder ? "error" : "warning"}
                  size="small"
                />
              </TableCell>
              <TableCell>{Math.round(pos.accuracy)}%</TableCell>
              <TableCell>{pos.bestMove}</TableCell>
              <TableCell>{pos.actualMove}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function WeaknessesSection({ weaknesses }: { weaknesses: WeaknessAnalysis[] }) {
  return (
    <Grid container spacing={3}>
      {weaknesses.map((weakness, index) => (
        <Grid item xs={12} key={index}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {weakness.phase.charAt(0).toUpperCase() + weakness.phase.slice(1)} Phase
            </Typography>
            <Typography variant="body1" gutterBottom>
              {weakness.description}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Frequency: {weakness.frequency} times
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Average evaluation drop: {weakness.averageEvalDrop.toFixed(2)}
              </Typography>
            </Box>
            {weakness.commonMistakes.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Common Mistakes:
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Correct Move</TableCell>
                        <TableCell>Played Move</TableCell>
                        <TableCell align="right">Eval Drop</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {weakness.commonMistakes.map((mistake, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{mistake.correctMove}</TableCell>
                          <TableCell>{mistake.playerMove}</TableCell>
                          <TableCell align="right">{mistake.evalDrop.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default function GameInsightsDialog({ open, onClose, userId }: Props) {
  const [insights, setInsights] = useState<GameInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { getUserGames } = useGameDatabase();

  useEffect(() => {
    const loadInsights = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        const games = await getUserGames(userId);
        const generatedInsights = generateGameInsights(userId, games);
        setInsights(generatedInsights);
      } catch (error) {
        console.error('Error generating insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [open, userId]);

  const formatPercentage = (value: number) => `${Math.round(value)}%`;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Game Insights
        {insights && (
          <Box sx={{ position: 'absolute', right: 16, top: 8 }}>
            <PDFDownloadLink
              document={generateInsightsPDF(insights)}
              fileName="chess-insights.pdf"
              style={{ textDecoration: 'none' }}
            >
              {({ blob, url, loading, error }) => (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  disabled={loading}
                >
                  Export PDF
                </Button>
              )}
            </PDFDownloadLink>
          </Box>
        )}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : insights ? (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Overview" />
                <Tab label="Openings" />
                <Tab label="Accuracy" />
                <Tab label="Critical Positions" />
                <Tab label="Weaknesses" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* Total Games */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Total Games Analyzed</Typography>
                    <Typography variant="h4">{insights.totalGames}</Typography>
                  </Paper>
                </Grid>

                {/* Win/Loss Ratio */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Performance as White</Typography>
                    <Typography>Wins: {insights.winLossRatio.white.wins}</Typography>
                    <Typography>Losses: {insights.winLossRatio.white.losses}</Typography>
                    <Typography>Draws: {insights.winLossRatio.white.draws}</Typography>
                    <Typography>
                      Win Rate: {formatPercentage(insights.winLossRatio.white.winRate)}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Performance as Black</Typography>
                    <Typography>Wins: {insights.winLossRatio.black.wins}</Typography>
                    <Typography>Losses: {insights.winLossRatio.black.losses}</Typography>
                    <Typography>Draws: {insights.winLossRatio.black.draws}</Typography>
                    <Typography>
                      Win Rate: {formatPercentage(insights.winLossRatio.black.winRate)}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Time Controls */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Time Controls</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={3}>
                        <Typography>Bullet: {insights.timeControls.bullet}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography>Blitz: {insights.timeControls.blitz}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography>Rapid: {insights.timeControls.rapid}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography>Classical: {insights.timeControls.classical}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Average Game Length */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Average Game Length</Typography>
                    <Typography variant="h4">{insights.averageGameLength} moves</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                {/* Most Played Openings */}
                <Grid item xs={12}>
                  <OpeningStatsTable 
                    stats={insights.openings.mostPlayed}
                    title="Most Played Openings"
                  />
                </Grid>

                {/* Best Performing Openings */}
                <Grid item xs={12}>
                  <OpeningStatsTable 
                    stats={insights.openings.bestPerformance}
                    title="Best Performing Openings (min. 3 games)"
                  />
                </Grid>

                {/* Worst Performing Openings */}
                <Grid item xs={12}>
                  <OpeningStatsTable 
                    stats={insights.openings.worstPerformance}
                    title="Openings to Improve (min. 3 games)"
                  />
                </Grid>

                {/* White Openings */}
                <Grid item xs={12} md={6}>
                  <OpeningStatsTable 
                    stats={insights.openings.asWhite}
                    title="Most Played as White"
                  />
                </Grid>

                {/* Black Openings */}
                <Grid item xs={12} md={6}>
                  <OpeningStatsTable 
                    stats={insights.openings.asBlack}
                    title="Most Played as Black"
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <AccuracySection accuracy={insights.accuracy} />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>Critical Positions</Typography>
              <CriticalPositionsSection positions={insights.criticalPositions} />
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <Typography variant="h6" gutterBottom>Areas for Improvement</Typography>
              <WeaknessesSection weaknesses={insights.weaknesses} />
            </TabPanel>
          </>
        ) : (
          <Typography>No games found to analyze.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
} 