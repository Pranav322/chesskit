import { Chess } from "chess.js";
import { ImportedGameData } from "@/types/database";
import { Timestamp } from "firebase/firestore";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingGameId?: string;
  matchReason?: "exact" | "similar";
  similarityScore?: number;
}

export interface GameSignature {
  date: Timestamp;
  whitePlayer: string;
  blackPlayer: string;
  firstMoves: string[];
  timeControl?: string;
  result?: string;
}

/**
 * Extracts a unique signature from a game for comparison
 */
export const getGameSignature = (game: ImportedGameData): GameSignature => {
  const chess = new Chess();
  chess.loadPgn(game.pgn);

  return {
    date: game.metadata.date,
    whitePlayer: game.metadata.white.name,
    blackPlayer: game.metadata.black.name,
    firstMoves: chess.history().slice(0, 10), // First 10 moves for comparison
    timeControl: game.metadata.timeControl,
    result: game.metadata.result,
  };
};

/**
 * Calculates similarity score between two games
 * Returns a value between 0 (completely different) and 1 (identical)
 */
export const calculateGameSimilarity = (
  sig1: GameSignature,
  sig2: GameSignature,
): number => {
  let score = 0;
  let totalWeight = 0;

  // Compare players (highest weight)
  const playerWeight = 0.4;
  if (
    sig1.whitePlayer === sig2.whitePlayer &&
    sig1.blackPlayer === sig2.blackPlayer
  ) {
    score += playerWeight;
  }
  totalWeight += playerWeight;

  // Compare date (medium weight)
  const dateWeight = 0.2;
  const dateDiff = Math.abs(sig1.date.seconds - sig2.date.seconds);
  if (dateDiff < 60 * 60) {
    // Within an hour
    score += dateWeight;
  } else if (dateDiff < 60 * 60 * 24) {
    // Within a day
    score += dateWeight * 0.5;
  }
  totalWeight += dateWeight;

  // Compare first moves (high weight)
  const movesWeight = 0.3;
  const minMoves = Math.min(sig1.firstMoves.length, sig2.firstMoves.length);
  let matchingMoves = 0;
  for (let i = 0; i < minMoves; i++) {
    if (sig1.firstMoves[i] === sig2.firstMoves[i]) {
      matchingMoves++;
    } else {
      break; // Stop at first mismatch
    }
  }
  score +=
    (movesWeight * matchingMoves) /
    Math.max(sig1.firstMoves.length, sig2.firstMoves.length);
  totalWeight += movesWeight;

  // Compare time control (low weight)
  const timeControlWeight = 0.1;
  if (sig1.timeControl === sig2.timeControl) {
    score += timeControlWeight;
  }
  totalWeight += timeControlWeight;

  return score / totalWeight;
};

/**
 * Checks if a game is a duplicate of any existing games
 */
export const checkForDuplicate = (
  newGame: ImportedGameData,
  existingGames: ImportedGameData[],
): DuplicateCheckResult => {
  const newSignature = getGameSignature(newGame);
  let highestSimilarity = 0;
  let mostSimilarGame: ImportedGameData | undefined;

  for (const existingGame of existingGames) {
    const existingSignature = getGameSignature(existingGame);
    const similarity = calculateGameSimilarity(newSignature, existingSignature);

    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      mostSimilarGame = existingGame;
    }

    // If we find an exact match, return immediately
    if (similarity === 1) {
      return {
        isDuplicate: true,
        existingGameId: existingGame.id,
        matchReason: "exact",
        similarityScore: 1,
      };
    }
  }

  // Consider games with high similarity (>0.8) as potential duplicates
  if (highestSimilarity > 0.8 && mostSimilarGame) {
    return {
      isDuplicate: true,
      existingGameId: mostSimilarGame.id,
      matchReason: "similar",
      similarityScore: highestSimilarity,
    };
  }

  return {
    isDuplicate: false,
    similarityScore: highestSimilarity,
  };
};
