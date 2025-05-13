import { ChessPlatformAPI, ImportServiceConfig } from './types';
import { ChessComGame } from '@/types/chessCom';

const DEFAULT_CONFIG: ImportServiceConfig = {
  maxConcurrentRequests: 5,
  requestDelay: 1000,
  retryAttempts: 3,
};

export class ChessComAPI implements ChessPlatformAPI {
  private config: ImportServiceConfig;
  private baseUrl = 'https://api.chess.com/pub';

  constructor(config: Partial<ImportServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private async fetchWithRetry(url: string, attempts = this.config.retryAttempts): Promise<Response> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (attempts > 1) {
        await new Promise(resolve => setTimeout(resolve, this.config.requestDelay));
        return this.fetchWithRetry(url, attempts - 1);
      }
      throw error;
    }
  }

  async validateUsername(username: string): Promise<boolean> {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/player/${username}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async getArchives(username: string): Promise<string[]> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/player/${username}/games/archives`);
    const data = await response.json();
    return data.archives as string[];
  }

  async fetchGames(username: string, count: number) {
    try {
      // Get archives (monthly)
      const archives = await this.getArchives(username);
      const games: ChessComGame[] = [];
      
      // Start from most recent archive
      for (const archiveUrl of archives.reverse()) {
        if (games.length >= count) break;

        await new Promise(resolve => setTimeout(resolve, this.config.requestDelay));
        
        const response = await this.fetchWithRetry(archiveUrl);
        const monthGames = await response.json();
        
        // Add games from this month until we reach count
        for (const game of monthGames.games) {
          if (games.length >= count) break;
          if (game.rules === 'chess' && !game.tournament) {
            games.push(game);
          }
        }
      }

      return {
        games: games.slice(0, count),
      };
    } catch (error) {
      return {
        games: [],
        error: error instanceof Error ? error.message : 'Failed to fetch games from Chess.com',
      };
    }
  }
} 