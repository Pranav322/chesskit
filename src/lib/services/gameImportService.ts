import { GameImportOptions, ImportProgress } from "@/types/importedGame";
import { GameOrigin } from "@/types/enums";
import { LichessAPI } from "../api/lichessAPI";
import { ChessComAPI } from "../api/chessComAPI";
import { ChessPlatformAPI } from "../api/types";
import { FirestoreService } from "./firestore";
import { ImportedGameData } from "@/types/database";
import { Timestamp } from "firebase/firestore";
import { AutoTagService } from "./autoTagService";
import { DuplicateCheckResult } from "./duplicateGameService";

export interface ImportGameResult {
  gameData: Omit<ImportedGameData, "id">;
  duplicateCheck?: DuplicateCheckResult & { existingGame?: ImportedGameData };
}

export type DuplicateResolution = "skip" | "overwrite" | "new";

export interface ImportGameOptions extends GameImportOptions {
  onDuplicateFound?: (result: ImportGameResult) => Promise<DuplicateResolution>;
}

export class GameImportService {
  private lichessAPI: LichessAPI;
  private chessComAPI: ChessComAPI;
  private firestoreService: FirestoreService;
  private autoTagService: AutoTagService;

  constructor() {
    this.lichessAPI = new LichessAPI();
    this.chessComAPI = new ChessComAPI();
    this.firestoreService = new FirestoreService();
    this.autoTagService = new AutoTagService();
  }

  private getAPI(platform: GameOrigin): ChessPlatformAPI {
    switch (platform) {
      case GameOrigin.Lichess:
        return this.lichessAPI;
      case GameOrigin.ChessCom:
        return this.chessComAPI;
      default:
        throw new Error("Unsupported platform");
    }
  }

  private async checkExistingGame(
    userId: string,
    platform: GameOrigin,
    originalId: string,
  ): Promise<ImportedGameData | null> {
    try {
      return await this.firestoreService.findGameByOriginalId(
        userId,
        platform,
        originalId,
      );
    } catch (error) {
      console.error("Error checking existing game:", error);
      return null;
    }
  }

  private generateOriginalId(platform: GameOrigin, game: any): string {
    // Generate a consistent originalId based on platform and game data
    switch (platform) {
      case GameOrigin.Lichess: {
        // Lichess games have a consistent ID format
        return `lichess-${game.id}`;
      }
      case GameOrigin.ChessCom: {
        // Chess.com games need a more complex ID due to their format
        const gameDate = new Date(
          game.end_time || game.lastMoveAt || game.createdAt,
        );
        const players = `${game.white?.username || ""}-vs-${game.black?.username || ""}`;
        return `chesscom-${gameDate.toISOString()}-${players}-${game.id || ""}`;
      }
      default: {
        // Fallback for unknown platforms
        return `${platform}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    }
  }

  async importGames(
    userId: string,
    username: string,
    options: ImportGameOptions,
    onProgress: (progress: ImportProgress) => void,
  ) {
    const api = this.getAPI(options.platform);

    // Validate username
    const isValid = await api.validateUsername(username);
    if (!isValid) {
      onProgress({
        total: 0,
        completed: 0,
        failed: 0,
        duplicates: 0,
        status: "failed",
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
      },
    );

    // Start import
    onProgress({
      total: options.count,
      completed: 0,
      failed: 0,
      duplicates: 0,
      status: "importing",
    });

    try {
      const { games, error } = await api.fetchGames(username, options.count);

      if (error) {
        throw new Error(error);
      }

      // Get existing games for similarity checking
      const existingGames = await this.firestoreService.getUserGames(userId, {
        source: options.platform,
        limit: 1000, // Increase limit to check against more games
      });

      // Create a map of existing originalIds for quick lookup
      const existingOriginalIds = new Map(
        existingGames.map((g) => [g.originalId, g]),
      );

      // Process games in chunks to avoid overwhelming Firestore
      const chunkSize = 10;
      let skipped = 0;
      let duplicates = 0;
      let applyToAllAction: "skip" | "overwrite" | null = null;

      for (let i = 0; i < games.length; i += chunkSize) {
        const chunk = games.slice(i, i + chunkSize);

        for (const game of chunk) {
          try {
            // Generate a consistent originalId
            const originalId = this.generateOriginalId(options.platform, game);
            let shouldOverwrite = false;
            let shouldSkip = false;

            // Check for existing game
            const existingGame = existingOriginalIds.get(originalId);
            if (existingGame) {
              duplicates++;

              // Update progress with current duplicate
              onProgress((prev) => ({
                ...prev,
                duplicates,
                currentDuplicate: {
                  gameId: originalId,
                  existingGame,
                },
              }));

              // If we have a saved action from "apply to all", use it
              if (applyToAllAction) {
                switch (applyToAllAction) {
                  case "skip":
                    shouldSkip = true;
                    skipped++;
                    break;
                  case "overwrite":
                    shouldOverwrite = true;
                    break;
                }
              }
              // Otherwise, ask user what to do
              else if (options.onDuplicateFound) {
                const result = await options.onDuplicateFound({
                  gameData: game,
                  duplicateCheck: {
                    isDuplicate: true,
                    existingGameId: existingGame.id,
                    matchReason: "exact",
                    similarityScore: 1,
                    existingGame,
                  },
                });

                // Handle the result
                const [action, applyToAll] = result;
                if (applyToAll) {
                  applyToAllAction = action;
                }

                switch (action) {
                  case "skip":
                    shouldSkip = true;
                    skipped++;
                    break;
                  case "overwrite":
                    shouldOverwrite = true;
                    break;
                }
              } else {
                // If no duplicate handler provided, skip by default
                shouldSkip = true;
                skipped++;
              }

              // Clear current duplicate from progress
              onProgress((prev) => ({
                ...prev,
                currentDuplicate: undefined,
              }));
            }

            if (shouldSkip) {
              onProgress((prev) => ({
                ...prev,
                completed: prev.completed + 1,
                status:
                  prev.completed + 1 >= prev.total ? "completed" : "importing",
              }));
              continue;
            }

            // Auto-tag the game if enabled
            let autoTags = undefined;
            if (options.autoTag) {
              autoTags = await this.autoTagService.tagGame(game.pgn);
            }

            const gameData: Omit<ImportedGameData, "id"> = {
              userId,
              source: options.platform,
              originalId,
              pgn: game.pgn,
              metadata: {
                date: Timestamp.fromMillis(game.end_time || Date.now()),
                platform: options.platform,
                timeControl: autoTags?.timeControl?.type || game.time_class,
                opening: autoTags?.opening,
                result: this.extractResult(game.pgn),
                white: {
                  name: game.white?.username || "Unknown",
                  rating: game.white?.rating,
                },
                black: {
                  name: game.black?.username || "Unknown",
                  rating: game.black?.rating,
                },
              },
              importedAt: Timestamp.now(),
              tags: autoTags?.tags || [],
            };

            try {
              // Save or update the game using transaction
              await this.firestoreService.saveOrUpdateGame(
                gameData,
                shouldOverwrite,
              );

              // Update progress
              await this.firestoreService.updateImportProgress(progressId, {
                completedGames: i + 1,
                status: i + 1 >= games.length ? "completed" : "importing",
              });

              onProgress((prev) => ({
                ...prev,
                completed: prev.completed + 1,
                status:
                  prev.completed + 1 >= prev.total ? "completed" : "importing",
              }));
            } catch (error) {
              console.error(`Failed to save game ${originalId}:`, error);
              throw error;
            }
          } catch (error) {
            if (error.message?.includes("already exists")) {
              // Silently skip duplicates that weren't caught earlier
              skipped++;
              duplicates++;
              onProgress((prev) => ({
                ...prev,
                completed: prev.completed + 1,
                status:
                  prev.completed + 1 >= prev.total ? "completed" : "importing",
              }));
            } else {
              console.error("Error processing game:", error);
              await this.firestoreService.updateImportProgress(progressId, {
                failedGames: i + 1,
              });

              onProgress((prev) => ({
                ...prev,
                failed: prev.failed + 1,
              }));
            }
          }
        }
      }

      // Create import history record with duplicate information
      await this.firestoreService.createImportHistory(
        userId,
        options.platform,
        "completed",
        {
          totalGames: games.length,
          completedGames: games.length - skipped,
          failedGames: 0,
          duplicates, // Add duplicate count to history
        },
      );

      onProgress((prev) => ({
        ...prev,
        status: "completed",
        completed: games.length - skipped,
        duplicates, // Add duplicate count to progress
      }));
    } catch (error) {
      // Update import progress as failed
      await this.firestoreService.updateImportProgress(progressId, {
        status: "failed",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });

      // Create failed import history record
      await this.firestoreService.createImportHistory(
        userId,
        options.platform,
        "failed",
        {
          totalGames: options.count,
          completedGames: 0,
          failedGames: options.count,
        },
        error instanceof Error ? error.message : "Unknown error occurred",
      );

      onProgress((prev) => ({
        ...prev,
        status: "failed",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }));
    }
  }

  private extractResult(pgn: string): string | undefined {
    const resultMatch = pgn.match(/\[Result "(.*?)"\]/);
    return resultMatch ? resultMatch[1] : undefined;
  }
}
