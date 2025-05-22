import { Game } from './game';
import { GameOrigin } from './gameOrigin';

export interface ImportedGame extends Omit<Game, 'tags'> {
  tags: {
    opening?: string;
    date?: string;
    platform: GameOrigin;
    timeControl?: string;
  };
  source: GameOrigin;
  originalId: string;
  importedAt: Date;
  lastAnalyzedAt?: Date;
  status: 'imported' | 'analyzing' | 'analyzed' | 'failed';
}

export interface GameImportOptions {
  platform: GameOrigin;
  count: 50 | 100 | 200 | 500;
  autoTag: boolean;
  backgroundImport: boolean;
}

export interface ImportProgress {
  total: number;
  completed: number;
  failed: number;
  status: "idle" | "importing" | "completed" | "failed";
  error?: string;
  duplicates?: number;
  currentDuplicate?: {
    gameId: string;
    existingGame?: ImportedGame;
  };
  onDuplicateAction?: (
    action: "skip" | "overwrite",
    applyToAll: boolean,
  ) => void;
}
