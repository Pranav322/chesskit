import { ChessPlatformAPI, ImportServiceConfig } from "./types";
import { LichessGame } from "@/types/lichess";

const DEFAULT_CONFIG: ImportServiceConfig = {
  maxConcurrentRequests: 5,
  requestDelay: 1000,
  retryAttempts: 3,
};

export class LichessAPI implements ChessPlatformAPI {
  private config: ImportServiceConfig;
  private baseUrl = "https://lichess.org/api";

  constructor(config: Partial<ImportServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private async fetchWithRetry(
    url: string,
    attempts = this.config.retryAttempts,
  ): Promise<Response> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (attempts > 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.config.requestDelay),
        );
        return this.fetchWithRetry(url, attempts - 1);
      }
      throw error;
    }
  }

  async validateUsername(username: string): Promise<boolean> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/user/${username}`,
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchGames(username: string, count: number) {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/games/user/${username}?max=${count}&perfType=bullet,blitz,rapid,classical&ongoing=false`,
      );

      const games = (await response.json()) as LichessGame[];

      return {
        games: games.slice(0, count),
      };
    } catch (error) {
      return {
        games: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch games from Lichess",
      };
    }
  }
}
