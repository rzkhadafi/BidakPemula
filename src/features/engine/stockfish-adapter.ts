import { EngineStatus } from "@/types/chess";

export interface EngineSearchOptions {
  fen: string;
  depth: number;
  moveTimeMs: number;
  skillLevel: number;
  searchId: string;
}

export interface EngineSearchResult {
  bestMoveUci: string;
  searchId: string;
  evaluationCp?: number;
  mateIn?: number;
}

export interface IChessEngine {
  init(): Promise<boolean>;
  search(options: EngineSearchOptions): Promise<EngineSearchResult>;
  stop(): void;
  destroy(): void;
  getStatus(): EngineStatus;
}

/**
 * Browser Web Worker implementation for Stockfish UCI protocol.
 */
export class StockfishWorkerEngine implements IChessEngine {
  private worker: Worker | null = null;
  private status: EngineStatus = "uninitialized";
  private activeSearchId: string | null = null;
  private isReady = false;
  private currentResolve: ((result: EngineSearchResult) => void) | null = null;
  private currentReject: ((error: Error) => void) | null = null;
  private searchTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private workerScriptUrl: string = "/engine/stockfish.js") {}

  public getStatus(): EngineStatus {
    return this.status;
  }

  public async init(): Promise<boolean> {
    if (typeof window === "undefined" || typeof Worker === "undefined") {
      this.status = "error";
      return false;
    }

    if (this.worker && this.isReady) {
      return true;
    }

    this.status = "loading";

    return new Promise<boolean>((resolve) => {
      try {
        this.worker = new Worker(this.workerScriptUrl);

        const initTimeout = setTimeout(() => {
          if (!this.isReady) {
            console.warn("Stockfish worker initialization timed out.");
            this.status = "error";
            resolve(false);
          }
        }, 8000);

        this.worker.onmessage = (event: MessageEvent) => {
          const line = typeof event.data === "string" ? event.data : String(event.data);
          this.handleUciLine(line);

          if (line.includes("uciok") || line.includes("readyok")) {
            if (!this.isReady) {
              this.isReady = true;
              this.status = "ready";
              clearTimeout(initTimeout);
              resolve(true);
            }
          }
        };

        this.worker.onerror = (err) => {
          console.error("Stockfish worker error:", err);
          this.status = "error";
          clearTimeout(initTimeout);
          resolve(false);
        };

        // Send UCI initiation commands
        this.worker.postMessage("uci");
        this.worker.postMessage("isready");
      } catch (err) {
        console.error("Failed to construct Stockfish worker:", err);
        this.status = "error";
        resolve(false);
      }
    });
  }

  private handleUciLine(line: string) {
    // Check for bestmove
    const match = line.match(/^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/);
    if (match && this.currentResolve && this.activeSearchId) {
      const bestMoveUci = match[1];
      const searchId = this.activeSearchId;

      if (this.searchTimeoutTimer) {
        clearTimeout(this.searchTimeoutTimer);
        this.searchTimeoutTimer = null;
      }

      const resolve = this.currentResolve;
      this.currentResolve = null;
      this.currentReject = null;
      this.status = "ready";
      this.activeSearchId = null;

      resolve({
        bestMoveUci,
        searchId,
      });
    }
  }

  public async search(options: EngineSearchOptions): Promise<EngineSearchResult> {
    if (!this.worker || !this.isReady) {
      const ok = await this.init();
      if (!ok || !this.worker) {
        throw new Error("Engine is not ready and could not be initialized.");
      }
    }

    // Cancel any previous search
    this.stop();

    this.status = "thinking";
    this.activeSearchId = options.searchId;

    return new Promise<EngineSearchResult>((resolve, reject) => {
      this.currentResolve = resolve;
      this.currentReject = reject;

      // Set timeout in case engine hangs
      const timeoutMs = options.moveTimeMs + 6000;
      this.searchTimeoutTimer = setTimeout(() => {
        if (this.currentReject && this.activeSearchId === options.searchId) {
          console.warn(`Stockfish search timed out for searchId: ${options.searchId}`);
          this.stop();
          this.status = "ready";
          reject(new Error("Stockfish search timed out."));
        }
      }, timeoutMs);

      try {
        // Configure skill level
        this.worker!.postMessage(`setoption name Skill Level value ${options.skillLevel}`);
        // Set position
        this.worker!.postMessage(`position fen ${options.fen}`);
        // Go search
        this.worker!.postMessage(
          `go depth ${options.depth} movetime ${options.moveTimeMs}`
        );
      } catch (err) {
        this.status = "error";
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  public stop(): void {
    if (this.searchTimeoutTimer) {
      clearTimeout(this.searchTimeoutTimer);
      this.searchTimeoutTimer = null;
    }

    if (this.worker) {
      try {
        this.worker.postMessage("stop");
      } catch {
        // ignore
      }
    }

    this.currentResolve = null;
    this.currentReject = null;
    this.activeSearchId = null;
    if (this.status === "thinking") {
      this.status = "ready";
    }
  }

  public destroy(): void {
    this.stop();
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {
        // ignore
      }
      this.worker = null;
    }
    this.isReady = false;
    this.status = "uninitialized";
  }
}

/**
 * Mock engine implementation for tests or environments without Web Workers.
 */
export class MockChessEngine implements IChessEngine {
  private status: EngineStatus = "ready";

  constructor(private mockMove: string = "e7e5") {}

  public setMockMove(moveUci: string) {
    this.mockMove = moveUci;
  }

  public async init(): Promise<boolean> {
    this.status = "ready";
    return true;
  }

  public async search(options: EngineSearchOptions): Promise<EngineSearchResult> {
    this.status = "thinking";
    await new Promise((r) => setTimeout(r, 50));
    this.status = "ready";
    return {
      bestMoveUci: this.mockMove,
      searchId: options.searchId,
    };
  }

  public stop(): void {
    this.status = "ready";
  }

  public destroy(): void {
    this.status = "uninitialized";
  }

  public getStatus(): EngineStatus {
    return this.status;
  }
}
