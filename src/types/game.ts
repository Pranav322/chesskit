import { GameEval } from "./eval";

export interface Game {
  id: number;
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
  metadata?: {
    white: Player;
    black: Player;
  };
}

export interface Player {
  name: string;
  rating?: number;
  avatarUrl?: string;
}
