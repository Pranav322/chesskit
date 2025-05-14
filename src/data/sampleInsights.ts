import { OpeningStats } from '@/types/insights';

export const sampleOpenings: {
  mostPlayed: OpeningStats[];
  bestPerformance: OpeningStats[];
  worstPerformance: OpeningStats[];
} = {
  mostPlayed: [
    {
      name: "Sicilian Defense",
      count: 3,
      wins: 2,
      losses: 1,
      draws: 0,
      winRate: 66.7
    },
    {
      name: "Ruy Lopez",
      count: 2,
      wins: 1,
      losses: 0,
      draws: 1,
      winRate: 50.0
    },
    {
      name: "French Defense",
      count: 2,
      wins: 1,
      losses: 1,
      draws: 0,
      winRate: 50.0
    },
    {
      name: "King's Indian Defense",
      count: 1,
      wins: 0,
      losses: 1,
      draws: 0,
      winRate: 0.0
    },
    {
      name: "Queen's Gambit",
      count: 1,
      wins: 1,
      losses: 0,
      draws: 0,
      winRate: 100.0
    }
  ],
  bestPerformance: [
    {
      name: "Sicilian Defense",
      count: 3,
      wins: 2,
      losses: 1,
      draws: 0,
      winRate: 66.7
    },
    {
      name: "Queen's Gambit",
      count: 1,
      wins: 1,
      losses: 0,
      draws: 0,
      winRate: 100.0
    },
    {
      name: "Ruy Lopez",
      count: 2,
      wins: 1,
      losses: 0,
      draws: 1,
      winRate: 50.0
    },
    {
      name: "French Defense",
      count: 2,
      wins: 1,
      losses: 1,
      draws: 0,
      winRate: 50.0
    },
    {
      name: "King's Indian Defense",
      count: 1,
      wins: 0,
      losses: 1,
      draws: 0,
      winRate: 0.0
    }
  ],
  worstPerformance: [
    {
      name: "King's Indian Defense",
      count: 1,
      wins: 0,
      losses: 1,
      draws: 0,
      winRate: 0.0
    },
    {
      name: "French Defense",
      count: 2,
      wins: 1,
      losses: 1,
      draws: 0,
      winRate: 50.0
    },
    {
      name: "Ruy Lopez",
      count: 2,
      wins: 1,
      losses: 0,
      draws: 1,
      winRate: 50.0
    },
    {
      name: "Sicilian Defense",
      count: 3,
      wins: 2,
      losses: 1,
      draws: 0,
      winRate: 66.7
    },
    {
      name: "Queen's Gambit",
      count: 1,
      wins: 1,
      losses: 0,
      draws: 0,
      winRate: 100.0
    }
  ]
}; 