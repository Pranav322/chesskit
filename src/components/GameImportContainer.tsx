import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { GameImportService } from '@/lib/services/gameImportService';
import { BackgroundJobService } from '@/lib/services/backgroundJobService';
import { FirestoreService } from '@/lib/services/firestore';
import { GameOrigin } from '@/types/enums';
import { toast } from 'react-hot-toast';

const LARGE_IMPORT_THRESHOLD = 100; // Number of games that triggers background processing

const GAME_COUNT_OPTIONS = [
  { value: 50, label: 'Last 50 Games' },
  { value: 100, label: 'Last 100 Games' },
  { value: 200, label: 'Last 200 Games' },
  { value: 500, label: 'Last 500 Games' },
];

export const GameImportContainer: React.FC = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [source, setSource] = useState<GameOrigin>(GameOrigin.Lichess);
  const [gameCount, setGameCount] = useState<number>(100); // Default to 100 games
  const [isLoading, setIsLoading] = useState(false);

  const gameImportService = new GameImportService();
  const backgroundJobService = new BackgroundJobService();
  const firestoreService = new FirestoreService();

  const handleImport = async () => {
    if (!user || !username.trim()) return;

    setIsLoading(true);
    try {
      // First, get the total number of games available
      const availableGames = await gameImportService.getGameCount(username, source);

      if (availableGames === 0) {
        toast.error('No games found for this username');
        return;
      }

      // Use the minimum between requested games and available games
      const totalGames = Math.min(gameCount, availableGames);

      if (totalGames > LARGE_IMPORT_THRESHOLD) {
        // Create a background job for large imports
        const jobId = await backgroundJobService.createImportJob({
          userId: user.uid,
          username,
          source,
          totalGames,
        });

        toast.success(
          `Started importing ${totalGames} games in the background. You can check the progress in your import history.`
        );
      } else {
        // Handle small imports directly
        const progressId = await firestoreService.createImportProgress(
          user.uid,
          source,
          totalGames,
          { username }
        );

        await gameImportService.importGames(username, source, {
          userId: user.uid,
          progressId,
          autoTag: true,
          limit: totalGames,
          onProgress: async (completed, failed) => {
            await firestoreService.updateImportProgress(progressId, {
              completedGames: completed,
              failedGames: failed,
              status: completed + failed === totalGames ? 'completed' : 'importing',
            });
          },
        });

        toast.success(`Successfully imported ${totalGames} games!`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import games. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Import Games</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Platform</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as GameOrigin)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          >
            <option value={GameOrigin.Lichess}>Lichess</option>
            <option value={GameOrigin.ChessCom}>Chess.com</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter username"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Number of Games</label>
          <select
            value={gameCount}
            onChange={(e) => setGameCount(Number(e.target.value))}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          >
            {GAME_COUNT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleImport}
          disabled={isLoading || !username.trim()}
          className={`w-full p-2 rounded text-white ${
            isLoading
              ? 'bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {isLoading ? 'Importing...' : 'Import Games'}
        </button>
      </div>
    </div>
  );
}; 