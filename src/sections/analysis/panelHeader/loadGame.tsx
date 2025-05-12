import LoadGameButton from "../../loadGame/loadGameButton";
import { useCallback, useEffect } from "react";
import { useChessActions } from "@/hooks/useChessActions";
import {
  boardAtom,
  boardOrientationAtom,
  evaluationProgressAtom,
  gameAtom,
  gameEvalAtom,
} from "../states";
import { useGameDatabase } from "@/hooks/useGameDatabase";
import { useAtomValue, useSetAtom } from "jotai";
import { Chess } from "chess.js";
import { useRouter } from "next/router";

export default function LoadGame() {
  const router = useRouter();
  const game = useAtomValue(gameAtom);
  const { setPgn: setGamePgn } = useChessActions(gameAtom);
  const { resetToStartingPosition: resetBoard } = useChessActions(boardAtom);
  const { gameFromUrl } = useGameDatabase();
  const setEval = useSetAtom(gameEvalAtom);
  const setBoardOrientation = useSetAtom(boardOrientationAtom);
  const evaluationProgress = useAtomValue(evaluationProgressAtom);

  const resetAndSetGamePgn = useCallback(
    (pgn: string) => {
      resetBoard(pgn);
      setEval(undefined);
      setGamePgn(pgn);
    },
    [resetBoard, setGamePgn, setEval]
  );

  useEffect(() => {
    const loadGame = async () => {
      if (!gameFromUrl) return;

      const gamefromDbChess = new Chess();
      gamefromDbChess.loadPgn(gameFromUrl.pgn);
      if (game.history().join() === gamefromDbChess.history().join()) return;

      resetAndSetGamePgn(gameFromUrl.pgn);
      setEval(gameFromUrl.eval);
      setBoardOrientation(
        gameFromUrl.black.name === "You" && gameFromUrl.site === "Chesskit.org"
          ? false
          : true
      );
    };

    loadGame();
  }, [gameFromUrl, game, resetAndSetGamePgn, setEval, setBoardOrientation]);

  const isGameLoaded =
    gameFromUrl !== undefined ||
    (!!game.getHeaders().White && game.getHeaders().White !== "?") ||
    game.history().length > 0;

  if (evaluationProgress) return null;

  return (
    <LoadGameButton
      label={isGameLoaded ? "Load another game" : "Load game"}
      size="small"
      setGame={async (game) => {
        await router.push("/");
        resetAndSetGamePgn(game.pgn());
      }}
    />
  );
}
