import { GameOrigin } from "./enums";
import { Timestamp } from "firebase/firestore";

export interface ImportedGameData {
  id: string;
  userId: string;
  source: GameOrigin;
  originalId: string;
  pgn: string;
  metadata: {
    date: Timestamp;
    platform: GameOrigin;
    opening?: string;
    timeControl?: string;
    result?: string;
    white: {
      name: string;
      rating?: number;
    };
    black: {
      name: string;
      rating?: number;
    };
  };
  importedAt: Timestamp;
  lastAnalyzedAt?: Timestamp;
}

export interface ImportHistoryData {
  id: string;
  userId: string;
  timestamp: Timestamp;
  source: GameOrigin;
  status: "completed" | "failed";
  totalGames: number;
  completedGames: number;
  failedGames: number;
  error?: string;
}

export interface ImportProgressData {
  id: string;
  userId: string;
  source: GameOrigin;
  status: "importing" | "completed" | "failed";
  totalGames: number;
  completedGames: number;
  failedGames: number;
  startedAt: Timestamp;
  lastUpdatedAt: Timestamp;
  error?: string;
  metadata: {
    username: string;
    autoTag: boolean;
    backgroundImport: boolean;
  };
}
