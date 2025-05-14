import { Game } from './game';
import { GameOrigin } from './enums';

export interface ImportedGame extends Game {
  userId: string;
  source: GameOrigin;
  importedAt: string;
  originalId: string;
  tags: {
    opening?: string;
    date?: string;
    platform: GameOrigin;
    timeControl?: string;
  };
  status: 'pending' | 'imported' | 'failed';
}

export interface GameImportOptions {
  platform: GameOrigin;
  count: 50 | 100 | 200;
  autoTag: boolean;
  backgroundImport: boolean;
}

export interface ImportProgress {
  total: number;
  completed: number;
  failed: number;
  status: 'idle' | 'importing' | 'completed' | 'failed';
  error?: string;
  duplicates?: number;
  currentDuplicate?: {
    gameId: string;
    existingGame?: ImportedGame;
  };
  onDuplicateAction?: (action: "skip" | "overwrite", applyToAll: boolean) => void;
} 