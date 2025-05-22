import { EngineName } from "@/types/enums";
import { UciEngine } from "./uciEngine";
import { isMultiThreadSupported, isWasmSupported } from "./shared";
import { getEngineWorkers } from "./worker";

export class Stockfish16_1 {
  public static async create(
    lite?: boolean,
    workersNb?: number,
  ): Promise<UciEngine> {
    if (!Stockfish16_1.isSupported()) {
      throw new Error("Stockfish 16.1 is not supported");
    }

    const multiThreadIsSupported = isMultiThreadSupported();
    if (!multiThreadIsSupported) console.log("Single thread mode");

    const enginePath = `engines/stockfish-16.1/stockfish-16.1${
      lite ? "-lite" : ""
    }${multiThreadIsSupported ? "" : "-single"}.js`;

    const engineName = lite
      ? EngineName.Stockfish16_1Lite
      : EngineName.Stockfish16_1;

    const workers = getEngineWorkers(enginePath, workersNb);

    return UciEngine.create(engineName, workers);
  }

  public static isSupported() {
    return isWasmSupported();
  }
}
