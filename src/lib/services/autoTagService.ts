import { Chess } from "chess.js";
import { openings } from "@/data/openings";

interface AutoTagResult {
  opening?: string;
  timeControl?: {
    baseTime: number; // in seconds
    increment: number; // in seconds
    type: "bullet" | "blitz" | "rapid" | "classical";
  };
  tags: string[];
}

export class AutoTagService {
  private chess: Chess;

  constructor() {
    this.chess = new Chess();
  }

  async tagGame(pgn: string): Promise<AutoTagResult> {
    const result: AutoTagResult = {
      tags: [],
    };

    try {
      // Load the game
      this.chess.loadPgn(pgn);

      // Get opening
      const opening = await this.identifyOpening();
      if (opening) {
        result.opening = opening;
        result.tags.push("opening:" + opening.split(" ")[0]); // Add main opening family as tag
      }

      // Parse time control
      const timeControl = this.parseTimeControl(pgn);
      if (timeControl) {
        result.timeControl = timeControl;
        result.tags.push("time:" + timeControl.type);
      }

      // Add special tags
      this.addSpecialTags(pgn, result.tags);

      return result;
    } catch (error) {
      console.error("Error in auto-tagging:", error);
      return result;
    }
  }

  private async identifyOpening(): Promise<string | undefined> {
    try {
      // Get first 10 moves
      const moves = this.chess.history().slice(0, 20); // 10 full moves
      if (moves.length === 0) return undefined;

      // Create a new chess instance for opening detection
      const openingChess = new Chess();

      // Find the deepest matching position in our opening database
      let lastMatchingOpening: string | undefined;

      for (let i = 0; i < moves.length; i++) {
        openingChess.move(moves[i]);
        const fen = openingChess.fen().split(" ")[0]; // Only position part

        const matchingOpening = openings.find((opening) => opening.fen === fen);
        if (matchingOpening) {
          lastMatchingOpening = matchingOpening.name;
        }
      }

      return lastMatchingOpening;
    } catch (error) {
      console.error("Error identifying opening:", error);
      return undefined;
    }
  }

  private parseTimeControl(
    pgn: string,
  ): AutoTagResult["timeControl"] | undefined {
    const timeControlMatch = pgn.match(/\[TimeControl "(.+)"\]/);
    if (!timeControlMatch) return undefined;

    const tc = timeControlMatch[1];

    // Parse time control string (e.g., "300+3", "600", "180+2")
    const [baseTime, increment = "0"] = tc.split("+").map(Number);

    if (isNaN(baseTime)) return undefined;

    const totalTime = baseTime + (increment ? parseInt(increment) : 0) * 40; // Estimate for 40 moves

    let type: AutoTagResult["timeControl"]["type"];
    if (totalTime <= 180)
      type = "bullet"; // 3 minutes or less
    else if (totalTime <= 600)
      type = "blitz"; // 10 minutes or less
    else if (totalTime <= 1800)
      type = "rapid"; // 30 minutes or less
    else type = "classical";

    return {
      baseTime,
      increment: Number(increment),
      type,
    };
  }

  private addSpecialTags(pgn: string, tags: string[]) {
    // Check for checkmate
    if (pgn.includes("#")) {
      tags.push("checkmate");
    }

    // Check for draws
    if (pgn.includes("1/2-1/2")) {
      tags.push("draw");

      // Check draw types
      if (pgn.includes("stalemate")) tags.push("draw:stalemate");
      if (pgn.includes("repetition")) tags.push("draw:repetition");
      if (pgn.includes("insufficient")) tags.push("draw:insufficient");
      if (pgn.includes("mutual")) tags.push("draw:agreement");
    }

    // Check for early game types
    const moves = this.chess.history();
    if (moves.length <= 30) tags.push("short-game");
    if (moves.length >= 60) tags.push("long-game");

    // Add material imbalance tags
    const finalPosition = this.chess.fen();
    if (this.hasMaterialImbalance(finalPosition)) {
      tags.push("material-imbalance");
    }
  }

  private hasMaterialImbalance(fen: string): boolean {
    const position = fen.split(" ")[0];
    const pieces = {
      white: { P: 0, N: 0, B: 0, R: 0, Q: 0 },
      black: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    };

    // Count pieces
    for (const char of position) {
      if (char in pieces.white)
        pieces.white[char as keyof typeof pieces.white]++;
      if (char in pieces.black)
        pieces.black[char as keyof typeof pieces.black]++;
    }

    // Check for significant material imbalance
    const whiteMaterial =
      pieces.white.P +
      3 * pieces.white.N +
      3 * pieces.white.B +
      5 * pieces.white.R +
      9 * pieces.white.Q;
    const blackMaterial =
      pieces.black.p +
      3 * pieces.black.n +
      3 * pieces.black.b +
      5 * pieces.black.r +
      9 * pieces.black.q;

    return Math.abs(whiteMaterial - blackMaterial) >= 3; // 3 points or more difference
  }

  private getTimeControlTag(timeControl?: string): string | null {
    if (!timeControl) return null;

    const [baseTime, increment = "0"] = timeControl.split("+").map(Number);
    const totalTime = baseTime + (increment ? parseInt(increment) : 0) * 40; // Estimate for 40 moves

    if (Object.prototype.hasOwnProperty.call(this.timeControlTags, totalTime)) {
      return this.timeControlTags[totalTime];
    }

    if (Object.prototype.hasOwnProperty.call(this.timeControlRanges, totalTime)) {
      return this.timeControlRanges[totalTime];
    }

    return null;
  }
}
