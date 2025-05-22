import { ChessComGame } from "@/types/chessCom";
import { LichessGame } from "@/types/lichess";

export interface ChessPlatformAPI {
  fetchGames(
    username: string,
    count: number,
  ): Promise<{
    games: ChessComGame[] | LichessGame[];
    error?: string;
  }>;
  validateUsername(username: string): Promise<boolean>;
}

export interface ImportServiceConfig {
  maxConcurrentRequests: number;
  requestDelay: number; // in milliseconds
  retryAttempts: number;
}
