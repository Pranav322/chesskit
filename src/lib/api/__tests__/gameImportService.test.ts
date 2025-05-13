import { GameImportService } from '../../services/gameImportService';
import { GameOrigin } from '@/types/enums';
import { ImportProgress } from '@/types/importedGame';

describe('GameImportService', () => {
  let service: GameImportService;
  let mockProgress: jest.Mock<void, [ImportProgress]>;

  beforeEach(() => {
    service = new GameImportService();
    mockProgress = jest.fn();
  });

  it('should validate username before importing', async () => {
    await service.importGames(
      'testUserId',
      'invalidUsername',
      {
        platform: GameOrigin.Lichess,
        count: 50,
        autoTag: true,
        backgroundImport: false,
      },
      mockProgress
    );

    expect(mockProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        error: expect.stringContaining('Invalid username'),
      })
    );
  });

  it('should update progress during import', async () => {
    const progressUpdates: ImportProgress[] = [];
    
    await service.importGames(
      'testUserId',
      'validUsername',
      {
        platform: GameOrigin.ChessCom,
        count: 50,
        autoTag: true,
        backgroundImport: false,
      },
      (progress) => {
        if (typeof progress === 'function') {
          const lastProgress = progressUpdates[progressUpdates.length - 1] || {
            total: 0,
            completed: 0,
            failed: 0,
            status: 'idle',
          };
          progressUpdates.push(progress(lastProgress));
        } else {
          progressUpdates.push(progress);
        }
      }
    );

    // Check progress updates
    expect(progressUpdates).toContainEqual(
      expect.objectContaining({
        status: 'importing',
        total: 50,
      })
    );

    // Should eventually complete or fail
    const finalProgress = progressUpdates[progressUpdates.length - 1];
    expect(['completed', 'failed']).toContain(finalProgress.status);
  });
}); 