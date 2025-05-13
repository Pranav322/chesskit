export interface OpeningStats {
  eco?: string;
  name: string;
  count: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export interface PositionAnalysis {
  fen: string;
  moveNumber: number;
  accuracy: number;
  evaluation: number;
  bestMove: string;
  actualMove: string;
  isMistake: boolean;
  isBlunder: boolean;
}

export interface AccuracyStats {
  overall: number;
  asWhite: number;
  asBlack: number;
  byTimeControl: {
    bullet: number;
    blitz: number;
    rapid: number;
    classical: number;
  };
  byPhase: {
    opening: number;
    middlegame: number;
    endgame: number;
  };
}

export interface WeaknessAnalysis {
  phase: "opening" | "middlegame" | "endgame";
  description: string;
  frequency: number;
  averageEvalDrop: number;
  commonMistakes: {
    fen: string;
    correctMove: string;
    playerMove: string;
    evalDrop: number;
  }[];
}

export interface GameInsights {
  userId: string;
  generatedAt: Date;
  totalGames: number;
  winLossRatio: {
    white: {
      wins: number;
      losses: number;
      draws: number;
      winRate: number;
    };
    black: {
      wins: number;
      losses: number;
      draws: number;
      winRate: number;
    };
  };
  timeControls: {
    bullet: number;
    blitz: number;
    rapid: number;
    classical: number;
  };
  averageGameLength: number;
  openings: {
    asWhite: OpeningStats[];
    asBlack: OpeningStats[];
    mostPlayed: OpeningStats[];
    bestPerformance: OpeningStats[];
    worstPerformance: OpeningStats[];
  };
  accuracy: AccuracyStats;
  criticalPositions: PositionAnalysis[];
  weaknesses: WeaknessAnalysis[];
}

export interface TimeControlStats {
  bullet: number;
  blitz: number;
  rapid: number;
  classical: number;
}

export interface ColorStats {
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
} 