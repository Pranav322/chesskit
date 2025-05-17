import { Chess } from 'chess.js';
import { ImportedGameData } from '@/types/database';
import { ColorStats, GameInsights, OpeningStats, TimeControlStats, AccuracyStats, PositionAnalysis, WeaknessAnalysis } from '@/types/insights';
import { openings } from '@/data/openings';
import { getPositionWinPercentage } from '@/lib/engine/helpers/winPercentage';

const MISTAKE_THRESHOLD = 0.3; // 30 centipawn loss
const BLUNDER_THRESHOLD = 1.0; // 100 centipawn loss

const calculateColorStats = (games: ImportedGameData[], color: 'white' | 'black'): ColorStats => {
  const username = "MagnusCarlsen"; // Use MagnusCarlsen as the fixed username
  
  const colorGames = games.filter(game => {
    if (color === 'white' && game.white.name === username) return true;
    if (color === 'black' && game.black.name === username) return true;
    return false;
  });

  const wins = colorGames.filter(game => {
    if (color === 'white' && game.result === '1-0') return true;
    if (color === 'black' && game.result === '0-1') return true;
    return false;
  }).length;

  const losses = colorGames.filter(game => {
    if (color === 'white' && game.result === '0-1') return true;
    if (color === 'black' && game.result === '1-0') return true;
    return false;
  }).length;

  const draws = colorGames.filter(game => 
    game.result === '1/2-1/2'
  ).length;

  const total = colorGames.length;
  const winRate = total > 0 ? (wins / total) * 100 : 0;

  return {
    wins,
    losses,
    draws,
    winRate
  };
};

const calculateTimeControlStats = (games: ImportedGameData[]): TimeControlStats => {
  const stats: TimeControlStats = {
    bullet: 0,
    blitz: 0,
    rapid: 0,
    classical: 0
  };

  games.forEach(game => {
    const timeControl = game.timeControl;
    if (!timeControl) return;

    // Parse time control string (e.g., "300+3", "180", etc.)
    const [baseTime, increment = "0"] = timeControl.split("+").map(Number);
    const totalTime = baseTime + (increment * 40); // Estimate 40 moves per game

    if (totalTime <= 180) stats.bullet++;
    else if (totalTime <= 600) stats.blitz++;
    else if (totalTime <= 1800) stats.rapid++;
    else stats.classical++;
  });

  return stats;
};

const calculateAverageGameLength = (games: ImportedGameData[]): number => {
  let totalMoves = 0;
  let validGames = 0;

  games.forEach(game => {
    const chess = new Chess();
    try {
      chess.loadPgn(game.pgn);
      totalMoves += chess.history().length / 2; // Divide by 2 to get number of full moves
      validGames++;
    } catch (error) {
      console.error('Error calculating game length:', error);
    }
  });

  return validGames > 0 ? Math.round(totalMoves / validGames) : 0;
};

const identifyOpening = (pgn: string): { name: string; eco?: string } => {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
    const moves = chess.history();
    let lastMatchedOpening = { name: "Unknown Opening" };
    let bestMatchLength = 0;

    // Try to match the position after each move against known openings
    for (let i = 1; i <= Math.min(moves.length, 15); i++) { 
      // Increased to 15 moves
      const tempChess = new Chess();
      const movesSlice = moves.slice(0, i);
      movesSlice.forEach(move => tempChess.move(move));
      const currentFen = tempChess.fen().split(' ')[0]; // Only compare piece positions

      // Try to find matching openings by comparing piece positions
      const matchedOpenings = openings.filter(op => {
        const openingFen = op.fen.split(' ')[0];
        // Compare piece positions only, ignoring castling rights and en passant
        return currentFen === openingFen;
      });

      // If we found matches, use the one that matches the most moves
      if (matchedOpenings.length > 0 && i > bestMatchLength) {
        // Prefer more specific (longer) opening names
        const bestMatch = matchedOpenings.reduce((best, current) => {
          return (current.name.length > best.name.length) ? current : best;
        });
        lastMatchedOpening = bestMatch;
        bestMatchLength = i;
      }

      // Also try to identify common opening patterns if no exact match
      if (i <= 4 && !matchedOpenings.length) {
        const moveStr = movesSlice.join(' ');
        // Common opening patterns
        if (moveStr.startsWith('e4 e5')) {
          if (moveStr.includes('Nf3')) lastMatchedOpening = { name: "King's Pawn Game" };
          if (moveStr.includes('Bc4')) lastMatchedOpening = { name: "Italian Game" };
        } else if (moveStr.startsWith('e4 c5')) {
          lastMatchedOpening = { name: "Sicilian Defense" };
        } else if (moveStr.startsWith('e4 e6')) {
          lastMatchedOpening = { name: "French Defense" };
        } else if (moveStr.startsWith('e4 c6')) {
          lastMatchedOpening = { name: "Caro-Kann Defense" };
        } else if (moveStr.startsWith('d4 d5')) {
          if (moveStr.includes('c4')) lastMatchedOpening = { name: "Queen's Gambit" };
          else lastMatchedOpening = { name: "Queen's Pawn Game" };
        } else if (moveStr.startsWith('d4 Nf6')) {
          lastMatchedOpening = { name: "Indian Defense" };
        } else if (moveStr.startsWith('c4')) {
          lastMatchedOpening = { name: "English Opening" };
        } else if (moveStr.startsWith('Nf3')) {
          lastMatchedOpening = { name: "Réti Opening" };
        }
      }
    }

    // If we still don't have a match but have moves, at least categorize by first move
    if (lastMatchedOpening.name === "Unknown Opening" && moves.length > 0) {
      const firstMove = moves[0];
      if (firstMove.startsWith('e')) lastMatchedOpening = { name: "King's Pawn Opening" };
      else if (firstMove.startsWith('d')) lastMatchedOpening = { name: "Queen's Pawn Opening" };
      else if (firstMove.startsWith('c')) lastMatchedOpening = { name: "English Opening" };
      else if (firstMove.startsWith('Nf3')) lastMatchedOpening = { name: "Réti Opening" };
      else if (firstMove.startsWith('f')) lastMatchedOpening = { name: "Bird's Opening" };
    }

    return lastMatchedOpening;
  } catch (error) {
    console.error('Error identifying opening:', error);
    return { name: "Unknown Opening" };
  }
};

const calculateOpeningStats = (games: ImportedGameData[], color: 'white' | 'black'): OpeningStats[] => {
  const openingStats = new Map<string, OpeningStats>();

  games.forEach(game => {
    const chess = new Chess();
    try {
      chess.loadPgn(game.pgn);
      const opening = identifyOpening(game.pgn);
      
      if (!openingStats.has(opening.name)) {
        openingStats.set(opening.name, {
          name: opening.name,
          eco: opening.eco,
          count: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0
        });
      }

      const stats = openingStats.get(opening.name)!;
      stats.count++;

      if (game.result === '1/2-1/2') {
        stats.draws++;
      } else if (
        (color === 'white' && game.result === '1-0') ||
        (color === 'black' && game.result === '0-1')
      ) {
        stats.wins++;
      } else {
        stats.losses++;
      }

      stats.winRate = (stats.wins / stats.count) * 100;
      openingStats.set(opening.name, stats);
    } catch (error) {
      console.error('Error processing game for opening stats:', error);
    }
  });

  return Array.from(openingStats.values());
};

const calculateAccuracy = (game: ImportedGameData, isWhite: boolean): number | null => {
  if (!game.eval) return null;

  const positions = game.eval.positions;
  let totalAccuracy = 0;
  let validPositions = 0;

  positions.forEach((pos, index) => {
    if ((index % 2 === 0) === isWhite && pos.bestMove) {
      // Get current position evaluation
      const currentEval = pos.lines[0]?.cp ? pos.lines[0].cp / 100 : 0;
      
      // Get next position evaluation (if available)
      const nextPos = positions[index + 1];
      const nextEval = nextPos?.lines[0]?.cp ? nextPos.lines[0].cp / 100 : 0;
      
      const evalDiff = Math.abs(currentEval - nextEval);
      const accuracy = calculateMoveAccuracy(evalDiff);
      if (accuracy !== null) {
        totalAccuracy += accuracy;
        validPositions++;
      }
    }
  });

  return validPositions > 0 ? totalAccuracy / validPositions : null;
};

const calculateMoveAccuracy = (evalDiff: number): number => {
  if (evalDiff <= 0.1) return 100; // Perfect move
  if (evalDiff <= 0.3) return 90;
  if (evalDiff <= 0.5) return 80;
  if (evalDiff <= 1.0) return 70;
  if (evalDiff <= 2.0) return 50;
  if (evalDiff <= 3.0) return 30;
  return Math.max(0, 20 - Math.floor(evalDiff));
};

const calculateAccuracyStats = (games: ImportedGameData[], userId: string): AccuracyStats => {
  const username = "MagnusCarlsen"; // Use MagnusCarlsen as the fixed username
  let totalAccuracy = 0;
  let whiteAccuracy = 0;
  let blackAccuracy = 0;
  let validGames = 0;
  let whiteGames = 0;
  let blackGames = 0;

  const timeControlAccuracy = {
    bullet: { total: 0, count: 0 },
    blitz: { total: 0, count: 0 },
    rapid: { total: 0, count: 0 },
    classical: { total: 0, count: 0 }
  };

  const phaseAccuracy = {
    opening: { total: 0, count: 0 },
    middlegame: { total: 0, count: 0 },
    endgame: { total: 0, count: 0 }
  };

  games.forEach(game => {
    if (!game.eval) return;

    const isWhite = game.white.name === username;
    const accuracy = calculateAccuracy(game, isWhite);
    
    if (accuracy !== null) {
      totalAccuracy += accuracy;
      validGames++;

      if (isWhite) {
        whiteAccuracy += accuracy;
        whiteGames++;
      } else {
        blackAccuracy += accuracy;
        blackGames++;
      }

      // Time control accuracy
      const timeControl = getTimeControlCategory(game.timeControl);
      if (timeControl) {
        timeControlAccuracy[timeControl].total += accuracy;
        timeControlAccuracy[timeControl].count++;
      }

      // Game phase accuracy
      const moveCount = game.eval.positions.length;
      game.eval.positions.forEach((pos, index) => {
        const phase = getGamePhase(index, moveCount);
        if ((index % 2 === 0) === isWhite) {
          const moveAccuracy = calculateMoveAccuracy(pos.lines[0]?.cp ? pos.lines[0].cp / 100 : 0);
          if (moveAccuracy !== null) {
            phaseAccuracy[phase].total += moveAccuracy;
            phaseAccuracy[phase].count++;
          }
        }
      });
    }
  });

  return {
    overall: validGames > 0 ? totalAccuracy / validGames : 0,
    asWhite: whiteGames > 0 ? whiteAccuracy / whiteGames : 0,
    asBlack: blackGames > 0 ? blackAccuracy / blackGames : 0,
    byTimeControl: {
      bullet: timeControlAccuracy.bullet.count > 0 ? timeControlAccuracy.bullet.total / timeControlAccuracy.bullet.count : 0,
      blitz: timeControlAccuracy.blitz.count > 0 ? timeControlAccuracy.blitz.total / timeControlAccuracy.blitz.count : 0,
      rapid: timeControlAccuracy.rapid.count > 0 ? timeControlAccuracy.rapid.total / timeControlAccuracy.rapid.count : 0,
      classical: timeControlAccuracy.classical.count > 0 ? timeControlAccuracy.classical.total / timeControlAccuracy.classical.count : 0
    },
    byPhase: {
      opening: phaseAccuracy.opening.count > 0 ? phaseAccuracy.opening.total / phaseAccuracy.opening.count : 0,
      middlegame: phaseAccuracy.middlegame.count > 0 ? phaseAccuracy.middlegame.total / phaseAccuracy.middlegame.count : 0,
      endgame: phaseAccuracy.endgame.count > 0 ? phaseAccuracy.endgame.total / phaseAccuracy.endgame.count : 0
    }
  };
};

const analyzeCriticalPositions = (games: ImportedGameData[], userId: string): PositionAnalysis[] => {
  const username = "MagnusCarlsen"; // Use MagnusCarlsen as the fixed username
  const criticalPositions: PositionAnalysis[] = [];

  games.forEach(game => {
    if (!game.eval) return;

    const isWhite = game.white.name === username;
    const positions = game.eval.positions;

    positions.forEach((pos, index) => {
      if ((index % 2 === 0) === isWhite && pos.bestMove) {
        // Get current position evaluation
        const currentEval = pos.lines[0]?.cp ? pos.lines[0].cp / 100 : 0;
        
        // Get next position evaluation (if available)
        const nextPos = positions[index + 1];
        const nextEval = nextPos?.lines[0]?.cp ? nextPos.lines[0].cp / 100 : 0;
        
        const evalDrop = Math.abs(currentEval - nextEval);
        const isMistake = evalDrop >= MISTAKE_THRESHOLD;
        const isBlunder = evalDrop >= BLUNDER_THRESHOLD;

        if (isMistake || isBlunder) {
          criticalPositions.push({
            fen: pos.fen,
            moveNumber: Math.floor(index / 2) + 1,
            accuracy: calculateMoveAccuracy(evalDrop),
            evaluation: currentEval,
            bestMove: pos.bestMove,
            actualMove: pos.lines[0]?.moves?.split(' ')[0] || '',
            isMistake,
            isBlunder
          });
        }
      }
    });
  });

  return criticalPositions.sort((a, b) => 
    (b.isBlunder ? 2 : b.isMistake ? 1 : 0) - (a.isBlunder ? 2 : a.isMistake ? 1 : 0)
  ).slice(0, 10);
};

const analyzeWeaknesses = (games: ImportedGameData[], userId: string): WeaknessAnalysis[] => {
  const username = "MagnusCarlsen"; // Use MagnusCarlsen as the fixed username
  console.log('Analyzing weaknesses for games:', games.length);
  
  const weaknesses: { [key: string]: WeaknessAnalysis } = {
    opening: {
      phase: "opening",
      description: "Opening mistakes",
      frequency: 0,
      averageEvalDrop: 0,
      commonMistakes: []
    },
    middlegame: {
      phase: "middlegame",
      description: "Middlegame tactical oversights",
      frequency: 0,
      averageEvalDrop: 0,
      commonMistakes: []
    },
    endgame: {
      phase: "endgame",
      description: "Endgame technique",
      frequency: 0,
      averageEvalDrop: 0,
      commonMistakes: []
    }
  };

  let totalMistakes = 0;
  let totalBlunders = 0;

  games.forEach((game, gameIndex) => {
    if (!game.eval) {
      console.log(`Game ${gameIndex} has no evaluation data`);
      return;
    }

    const isWhite = game.white.name === username;
    const positions = game.eval.positions;
    const moveCount = positions.length;
    console.log(`Analyzing game ${gameIndex} (${isWhite ? 'white' : 'black'}), ${moveCount} positions`);

    positions.forEach((pos, index) => {
      if ((index % 2 === 0) === isWhite && pos.bestMove) {
        const phase = getGamePhase(index, moveCount);
        
        // Get current position evaluation
        const currentEval = pos.lines[0]?.cp ? pos.lines[0].cp / 100 : 0;
        
        // Get next position evaluation (if available)
        const nextPos = positions[index + 1];
        const nextEval = nextPos?.lines[0]?.cp ? nextPos.lines[0].cp / 100 : 0;
        
        // Calculate evaluation drop (positive means advantage decreased)
        const evalDrop = Math.abs(currentEval - nextEval);
        console.log(`Move ${index + 1} (${phase}): currentEval = ${currentEval}, nextEval = ${nextEval}, evalDrop = ${evalDrop}`);

        if (evalDrop >= MISTAKE_THRESHOLD) {
          weaknesses[phase].frequency++;
          weaknesses[phase].averageEvalDrop += evalDrop;
          totalMistakes++;
          
          if (evalDrop >= BLUNDER_THRESHOLD) {
            totalBlunders++;
            weaknesses[phase].commonMistakes.push({
              fen: pos.fen,
              correctMove: pos.bestMove,
              playerMove: pos.lines[0]?.moves?.split(' ')[0] || '',
              evalDrop
            });
          }
        }
      }
    });
  });

  // Calculate averages and sort mistakes
  Object.values(weaknesses).forEach(w => {
    if (w.frequency > 0) {
      w.averageEvalDrop /= w.frequency;
      w.commonMistakes.sort((a, b) => b.evalDrop - a.evalDrop);
      w.commonMistakes = w.commonMistakes.slice(0, 3); // Keep top 3 mistakes
    }
  });

  console.log('Analysis Summary:', {
    totalGames: games.length,
    gamesWithEval: games.filter(g => g.eval).length,
    totalMistakes,
    totalBlunders,
    phaseBreakdown: Object.entries(weaknesses).map(([phase, w]) => ({
      phase,
      frequency: w.frequency,
      avgEvalDrop: w.averageEvalDrop.toFixed(2),
      mistakes: w.commonMistakes.length
    }))
  });

  return Object.values(weaknesses).sort((a, b) => b.frequency - a.frequency);
};

const getTimeControlCategory = (timeControl?: string): keyof TimeControlStats | null => {
  if (!timeControl) return null;

  const [baseTime, increment = "0"] = timeControl.split("+").map(Number);
  const totalTime = baseTime + (increment * 40);

  if (totalTime <= 180) return "bullet";
  if (totalTime <= 600) return "blitz";
  if (totalTime <= 1800) return "rapid";
  return "classical";
};

const getGamePhase = (moveIndex: number, totalMoves: number): "opening" | "middlegame" | "endgame" => {
  const movePercentage = moveIndex / totalMoves;
  if (movePercentage <= 0.2) return "opening";
  if (movePercentage <= 0.7) return "middlegame";
  return "endgame";
};

export const generateGameInsights = (
  userId: string,
  games: ImportedGameData[]
): GameInsights => {
  const username = "MagnusCarlsen"; // Use MagnusCarlsen as the fixed username
  
  // If no games, return empty data structure
  if (games.length === 0) {
    return {
      userId,
      generatedAt: new Date(),
      totalGames: 0,
      winLossRatio: {
        white: { wins: 0, losses: 0, draws: 0, winRate: 0 },
        black: { wins: 0, losses: 0, draws: 0, winRate: 0 }
      },
      timeControls: {
        bullet: 0,
        blitz: 0,
        rapid: 0,
        classical: 0
      },
      averageGameLength: 0,
      openings: {
        asWhite: [],
        asBlack: [],
        mostPlayed: [],
        bestPerformance: [],
        worstPerformance: []
      },
      accuracy: {
        overall: 0,
        asWhite: 0,
        asBlack: 0,
        byTimeControl: {
          bullet: 0,
          blitz: 0,
          rapid: 0,
          classical: 0
        },
        byPhase: {
          opening: 0,
          middlegame: 0,
          endgame: 0
        }
      },
      criticalPositions: [],
      weaknesses: []
    };
  }

  const whiteStats = calculateColorStats(games, 'white');
  const blackStats = calculateColorStats(games, 'black');
  const timeControls = calculateTimeControlStats(games);
  const averageGameLength = calculateAverageGameLength(games);

  // Calculate opening statistics
  const whiteOpenings = calculateOpeningStats(games.filter(g => g.white.name === username), 'white');
  const blackOpenings = calculateOpeningStats(games.filter(g => g.black.name === username), 'black');
  
  // Most played openings (combine both colors)
  const allOpenings = [...whiteOpenings, ...blackOpenings].reduce((acc, curr) => {
    const existing = acc.find(o => o.name === curr.name);
    if (existing) {
      existing.count += curr.count;
      existing.wins += curr.wins;
      existing.losses += curr.losses;
      existing.draws += curr.draws;
      existing.winRate = (existing.wins / existing.count) * 100;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, [] as OpeningStats[]);

  // Sort openings by various criteria
  const mostPlayed = [...allOpenings].sort((a, b) => b.count - a.count).slice(0, 5);
  const bestPerformance = [...allOpenings]
    .filter(o => o.count >= 3)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 5);
  const worstPerformance = [...allOpenings]
    .filter(o => o.count >= 3)
    .sort((a, b) => a.winRate - b.winRate)
    .slice(0, 5);

  // Calculate advanced statistics
  const accuracy = calculateAccuracyStats(games, username);
  const criticalPositions = analyzeCriticalPositions(games, username);
  const weaknesses = analyzeWeaknesses(games, username);

  return {
    userId,
    generatedAt: new Date(),
    totalGames: games.length,
    winLossRatio: {
      white: whiteStats,
      black: blackStats
    },
    timeControls,
    averageGameLength,
    openings: {
      asWhite: whiteOpenings.sort((a, b) => b.count - a.count).slice(0, 5),
      asBlack: blackOpenings.sort((a, b) => b.count - a.count).slice(0, 5),
      mostPlayed,
      bestPerformance,
      worstPerformance
    },
    accuracy,
    criticalPositions,
    weaknesses
  };
}; 