import { GameImportOptions, ImportProgress } from '@/types/importedGame';
import { GameOrigin } from '@/types/enums';
import { LichessAPI } from '../api/lichessAPI';
import { ChessComAPI } from '../api/chessComAPI';
import { ChessPlatformAPI } from '../api/types';

export class GameImportService {
  private lichessAPI: LichessAPI;
  private chessComAPI: ChessComAPI;

  constructor() {
    this.lichessAPI = new LichessAPI();
    this.chessComAPI = new ChessComAPI();
  }

  private getAPI(platform: GameOrigin): ChessPlatformAPI {
    switch (platform) {
      case GameOrigin.Lichess:
        return this.lichessAPI;
      case GameOrigin.ChessCom:
        return this.chessComAPI;
      default:
        throw new Error('Unsupported platform');
    }
  }

  async importGames(
    userId: string,
    username: string,
    options: GameImportOptions,
    onProgress: (progress: ImportProgress) => void
  ) {
    const api = this.getAPI(options.platform);

    // Validate username
    const isValid = await api.validateUsername(username);
    if (!isValid) {
      onProgress({
        total: 0,
        completed: 0,
        failed: 0,
        status: 'failed',
        error: `Invalid username for ${options.platform}`,
      });
      return;
    }

    // Start import
    onProgress({
      total: options.count,
      completed: 0,
      failed: 0,
      status: 'importing',
    });

    try {
      const { games, error } = await api.fetchGames(username, options.count);
      
      if (error) {
        throw new Error(error);
      }

      // Process games in chunks to avoid overwhelming the system
      const chunkSize = 10;
      for (let i = 0; i < games.length; i += chunkSize) {
        const chunk = games.slice(i, i + chunkSize);
        
        // Process chunk (in Phase 3, this will be done in background)
        await Promise.all(chunk.map(async (game) => {
          try {
            // TODO: Store game in database (Phase 3)
            // For now, just simulate processing time
            await new Promise(resolve => setTimeout(resolve, 100));
            
            onProgress(prev => ({
              ...prev,
              completed: prev.completed + 1,
              status: prev.completed + 1 >= prev.total ? 'completed' : 'importing',
            }));
          } catch (error) {
            onProgress(prev => ({
              ...prev,
              failed: prev.failed + 1,
            }));
          }
        }));
      }

      onProgress(prev => ({
        ...prev,
        status: 'completed',
      }));
    } catch (error) {
      onProgress(prev => ({
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  }
} 