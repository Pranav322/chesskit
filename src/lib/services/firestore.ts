import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  updateDoc,
  DocumentReference,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ImportedGameData, ImportHistoryData, ImportProgressData } from '@/types/database';
import { GameOrigin } from '@/types/enums';

export class FirestoreService {
  private gamesCollection = collection(db, 'games');
  private importHistoryCollection = collection(db, 'importHistory');
  private importProgressCollection = collection(db, 'importProgress');
  private backgroundJobsCollection = collection(db, 'backgroundJobs');

  // Background Jobs Methods
  async createBackgroundJob<T extends object>(jobData: T): Promise<string> {
    const jobRef = doc(this.backgroundJobsCollection);
    await setDoc(jobRef, jobData);
    return jobRef.id;
  }

  async updateBackgroundJob(jobId: string, update: object): Promise<void> {
    const jobRef = doc(this.backgroundJobsCollection, jobId);
    await updateDoc(jobRef, update);
  }

  async getBackgroundJob<T>(jobId: string): Promise<T | null> {
    const jobRef = doc(this.backgroundJobsCollection, jobId);
    const jobDoc = await getDoc(jobRef);
    return jobDoc.exists() ? { id: jobDoc.id, ...jobDoc.data() } as T : null;
  }

  async getNextPendingJob<T>(): Promise<T | null> {
    const jobQuery = query(
      this.backgroundJobsCollection,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc'),
      limit(1)
    );

    const snapshot = await getDocs(jobQuery);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as T;
  }

  // Import Progress Methods
  async createImportProgress(
    userId: string,
    source: GameOrigin,
    totalGames: number,
    metadata: ImportProgressData['metadata']
  ): Promise<string> {
    const progressData: Omit<ImportProgressData, 'id'> = {
      userId,
      source,
      status: 'importing',
      totalGames,
      completedGames: 0,
      failedGames: 0,
      startedAt: Timestamp.now(),
      lastUpdatedAt: Timestamp.now(),
      metadata,
    };

    const progressRef = doc(this.importProgressCollection);
    await setDoc(progressRef, progressData);
    return progressRef.id;
  }

  async updateImportProgress(
    progressId: string,
    update: Partial<ImportProgressData>
  ): Promise<void> {
    const progressRef = doc(this.importProgressCollection, progressId);
    await updateDoc(progressRef, {
      ...update,
      lastUpdatedAt: Timestamp.now(),
    });
  }

  async getImportProgress(progressId: string): Promise<ImportProgressData | null> {
    const progressRef = doc(this.importProgressCollection, progressId);
    const progressDoc = await getDoc(progressRef);
    return progressDoc.exists()
      ? ({ id: progressDoc.id, ...progressDoc.data() } as ImportProgressData)
      : null;
  }

  // Import History Methods
  async createImportHistory(
    userId: string,
    source: GameOrigin,
    status: ImportHistoryData['status'],
    stats: Pick<ImportHistoryData, 'totalGames' | 'completedGames' | 'failedGames'>,
    error?: string
  ): Promise<string> {
    const historyData: Omit<ImportHistoryData, 'id'> = {
      userId,
      timestamp: Timestamp.now(),
      source,
      status,
      ...stats,
      ...(error && { error }),
    };

    const historyRef = doc(this.importHistoryCollection);
    await setDoc(historyRef, historyData);
    return historyRef.id;
  }

  async getImportHistory(userId: string, limit = 10): Promise<ImportHistoryData[]> {
    const historyQuery = query(
      this.importHistoryCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(historyQuery);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ImportHistoryData)
    );
  }

  // Games Methods
  async saveGame(game: Omit<ImportedGameData, 'id'>): Promise<string> {
    const gameRef = doc(this.gamesCollection);
    await setDoc(gameRef, {
      ...game,
      importedAt: Timestamp.now(),
    });
    return gameRef.id;
  }

  async getGame(gameId: string): Promise<ImportedGameData | null> {
    const gameRef = doc(this.gamesCollection, gameId);
    const gameDoc = await getDoc(gameRef);
    return gameDoc.exists()
      ? ({ id: gameDoc.id, ...gameDoc.data() } as ImportedGameData)
      : null;
  }

  async getUserGames(
    userId: string,
    options: {
      limit?: number;
      source?: GameOrigin;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<ImportedGameData[]> {
    const { limit: queryLimit = 50, source, startDate, endDate } = options;

    let gameQuery = query(
      this.gamesCollection,
      where('userId', '==', userId),
      orderBy('metadata.date', 'desc'),
      limit(queryLimit)
    );

    if (source) {
      gameQuery = query(gameQuery, where('source', '==', source));
    }

    if (startDate) {
      gameQuery = query(
        gameQuery,
        where('metadata.date', '>=', Timestamp.fromDate(startDate))
      );
    }

    if (endDate) {
      gameQuery = query(
        gameQuery,
        where('metadata.date', '<=', Timestamp.fromDate(endDate))
      );
    }

    const snapshot = await getDocs(gameQuery);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ImportedGameData)
    );
  }

  // Error handling wrapper
  async handleFirestoreOperation<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(
        `Firestore operation failed: ${errorMessage}`,
        error instanceof FirestoreError ? error.code : error
      );
      throw error;
    }
  }
} 