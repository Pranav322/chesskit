import { EngineName } from "@/types/enums";
import { UciEngine } from "./uciEngine";
import { isMultiThreadSupported, isWasmSupported } from "./shared";
import { getEngineWorkers } from "./worker";

export class Stockfish17 {
  public static async create(
    lite?: boolean,
    workersNb?: number,
  ): Promise<UciEngine> {
    if (!Stockfish17.isSupported()) {
      throw new Error("Stockfish 17 is not supported");
    }

    const multiThreadIsSupported = isMultiThreadSupported();
    if (!multiThreadIsSupported) console.log("Single thread mode");

    const enginePath = `engines/stockfish-17/stockfish-17${
      lite ? "-lite" : ""
    }${multiThreadIsSupported ? "" : "-single"}.js`;

    const engineName = lite
      ? EngineName.Stockfish17Lite
      : EngineName.Stockfish17;

    const workers = getEngineWorkers(enginePath, workersNb);

    return UciEngine.create(engineName, workers);
  }

  public static isSupported() {
    return isWasmSupported();
  }
}
