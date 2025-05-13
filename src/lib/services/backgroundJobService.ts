import { GameImportOptions } from '@/types/importedGame';
import { FirestoreService } from './firestore';
import { GameImportService } from './gameImportService';
import { Timestamp } from 'firebase/firestore';

interface JobData {
  id: string;
  userId: string;
  type: 'import';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: {
    username: string;
    options: GameImportOptions;
  };
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  error?: string;
}

export class BackgroundJobService {
  private firestoreService: FirestoreService;
  private gameImportService: GameImportService;
  private isProcessing: boolean = false;
  private currentJobId?: string;

  constructor() {
    this.firestoreService = new FirestoreService();
    this.gameImportService = new GameImportService();
  }

  async createImportJob(
    userId: string,
    username: string,
    options: GameImportOptions
  ): Promise<string> {
    const jobData: Omit<JobData, 'id'> = {
      userId,
      type: 'import',
      status: 'pending',
      data: {
        username,
        options,
      },
      progress: {
        total: options.count,
        completed: 0,
        failed: 0,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Create job in Firestore
    const jobRef = await this.firestoreService.createBackgroundJob(jobData);
    
    // Start processing if not already processing
    if (!this.isProcessing) {
      this.processNextJob();
    }

    return jobRef;
  }

  private async processNextJob() {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;

      // Get next pending job
      const job = await this.firestoreService.getNextPendingJob();
      if (!job) {
        this.isProcessing = false;
        return;
      }

      this.currentJobId = job.id;

      // Update job status to processing
      await this.firestoreService.updateBackgroundJob(job.id, {
        status: 'processing',
        updatedAt: Timestamp.now(),
      });

      // Process the job
      await this.gameImportService.importGames(
        job.userId,
        job.data.username,
        job.data.options,
        async (progress) => {
          // Update job progress
          await this.firestoreService.updateBackgroundJob(job.id, {
            progress: {
              total: progress.total,
              completed: progress.completed,
              failed: progress.failed,
            },
            status: progress.status === 'completed' ? 'completed' : 'processing',
            updatedAt: Timestamp.now(),
            ...(progress.error && { error: progress.error }),
          });
        }
      );

      // Mark job as completed
      await this.firestoreService.updateBackgroundJob(job.id, {
        status: 'completed',
        updatedAt: Timestamp.now(),
      });

    } catch (error) {
      // Update job with error
      if (this.currentJobId) {
        await this.firestoreService.updateBackgroundJob(this.currentJobId, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          updatedAt: Timestamp.now(),
        });
      }
    } finally {
      this.isProcessing = false;
      this.currentJobId = undefined;

      // Process next job if any
      setTimeout(() => this.processNextJob(), 1000);
    }
  }

  async getJobStatus(jobId: string): Promise<JobData | null> {
    return this.firestoreService.getBackgroundJob(jobId);
  }

  async cancelJob(jobId: string): Promise<void> {
    await this.firestoreService.updateBackgroundJob(jobId, {
      status: 'failed',
      error: 'Job cancelled by user',
      updatedAt: Timestamp.now(),
    });
  }
} 