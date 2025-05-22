import { EngineName } from "@/types/enums";
import { UciEngine } from "./uciEngine";
import { isMultiThreadSupported, isWasmSupported } from "./shared";
import { getEngineWorkers } from "./worker";

export class Stockfish16 {
  public static async create(
    nnue?: boolean,
    workersNb?: number,
  ): Promise<UciEngine> {
    if (!Stockfish16.isSupported()) {
      throw new Error("Stockfish 16 is not supported");
    }

    const multiThreadIsSupported = isMultiThreadSupported();
    if (!multiThreadIsSupported) console.log("Single thread mode");

    const enginePath = multiThreadIsSupported
      ? "engines/stockfish-16/stockfish-nnue-16.js"
      : "engines/stockfish-16/stockfish-nnue-16-single.js";

    const customEngineInit = async (
      sendCommands: UciEngine["sendCommands"],
    ) => {
      await sendCommands(
        [`setoption name Use NNUE value ${!!nnue}`, "isready"],
        "readyok",
      );
    };

    const engineName = nnue
      ? EngineName.Stockfish16NNUE
      : EngineName.Stockfish16;

    const workers = getEngineWorkers(enginePath, workersNb);

    return UciEngine.create(engineName, workers, customEngineInit);
  }

  public static isSupported() {
    return isWasmSupported();
  }
}
