import { GameEval } from "./eval";
import { GameOrigin } from "./enums";

export interface Game {
  id: number;
  userId: string;
  pgn: string;
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white: Player;
  black: Player;
  result?: string;
  eval?: GameEval;
  termination?: string;
  timeControl?: string;
  isFavorite?: boolean;
  notes?: string;
  tags?: string[];
  metadata?: {
    white: Player;
    black: Player;
    platform?: GameOrigin;
  };
}

export interface Player {
  name: string;
  rating?: number;
  avatarUrl?: string;
}
