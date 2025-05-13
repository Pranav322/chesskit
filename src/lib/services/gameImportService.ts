import { GameImportOptions, ImportProgress } from '@/types/importedGame';
import { GameOrigin } from '@/types/enums';
import { LichessAPI } from '../api/lichessAPI';
import { ChessComAPI } from '../api/chessComAPI';
import { ChessPlatformAPI } from '../api/types';
import { FirestoreService } from './firestore';
import { ImportedGameData } from '@/types/database';
import { Timestamp } from 'firebase/firestore';

export class GameImportService {
  private lichessAPI: LichessAPI;
  private chessComAPI: ChessComAPI;
  private firestoreService: FirestoreService;

  constructor() {
    this.lichessAPI = new LichessAPI();
    this.chessComAPI = new ChessComAPI();
    this.firestoreService = new FirestoreService();
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

    // Create import progress record
    const progressId = await this.firestoreService.createImportProgress(
      userId,
      options.platform,
      options.count,
      {
        username,
        autoTag: options.autoTag,
        backgroundImport: options.backgroundImport,
      }
    );

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

      // Process games in chunks to avoid overwhelming Firestore
      const chunkSize = 10;
      for (let i = 0; i < games.length; i += chunkSize) {
        const chunk = games.slice(i, i + chunkSize);
        
        await Promise.all(chunk.map(async (game) => {
          try {
            const gameData: Omit<ImportedGameData, 'id'> = {
              userId,
              source: options.platform,
              originalId: game.id || `${options.platform}-${Date.now()}`,
              pgn: game.pgn,
              metadata: {
                date: Timestamp.fromMillis(game.end_time || Date.now()),
                platform: options.platform,
                timeControl: game.time_class || undefined,
                result: this.extractResult(game.pgn),
                white: {
                  name: game.white?.username || 'Unknown',
                  rating: game.white?.rating,
                },
                black: {
                  name: game.black?.username || 'Unknown',
                  rating: game.black?.rating,
                },
              },
              importedAt: Timestamp.now(),
            };

            await this.firestoreService.saveGame(gameData);
            
            // Update progress
            await this.firestoreService.updateImportProgress(progressId, {
              completedGames: i + 1,
              status: i + 1 >= games.length ? 'completed' : 'importing',
            });

            onProgress(prev => ({
              ...prev,
              completed: prev.completed + 1,
              status: prev.completed + 1 >= prev.total ? 'completed' : 'importing',
            }));
          } catch (error) {
            await this.firestoreService.updateImportProgress(progressId, {
              failedGames: i + 1,
            });

            onProgress(prev => ({
              ...prev,
              failed: prev.failed + 1,
            }));
          }
        }));
      }

      // Create import history record
      await this.firestoreService.createImportHistory(
        userId,
        options.platform,
        'completed',
        {
          totalGames: games.length,
          completedGames: games.length,
          failedGames: 0,
        }
      );

      onProgress(prev => ({
        ...prev,
        status: 'completed',
      }));
    } catch (error) {
      // Update import progress as failed
      await this.firestoreService.updateImportProgress(progressId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });

      // Create failed import history record
      await this.firestoreService.createImportHistory(
        userId,
        options.platform,
        'failed',
        {
          totalGames: options.count,
          completedGames: 0,
          failedGames: options.count,
        },
        error instanceof Error ? error.message : 'Unknown error occurred'
      );

      onProgress(prev => ({
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  }

  private extractResult(pgn: string): string | undefined {
    const resultMatch = pgn.match(/\[Result "(.*?)"\]/);
    return resultMatch ? resultMatch[1] : undefined;
  }
} 