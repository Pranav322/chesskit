import React, { useState } from 'react';
import { GameImportForm } from './GameImportForm';
import { ImportProgress } from './ImportProgress';
import { GameImportOptions, ImportProgress as ImportProgressType } from '@/types/importedGame';
import { useAuth } from '@/contexts/AuthContext';
import { GameImportService } from '@/lib/services/gameImportService';

const initialProgress: ImportProgressType = {
  total: 0,
  completed: 0,
  failed: 0,
  status: 'idle',
};

export const GameImportContainer: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ImportProgressType>(initialProgress);
  const [username, setUsername] = useState('');
  const importService = new GameImportService();

  const handleImport = async (options: GameImportOptions) => {
    if (!user || !username) {
      setProgress({
        ...initialProgress,
        status: 'failed',
        error: !user ? 'Please log in to import games' : 'Please enter a username',
      });
      return;
    }

    try {
      await importService.importGames(
        user.uid,
        username,
        options,
        (newProgress) => {
          if (typeof newProgress === 'function') {
            setProgress(prev => newProgress(prev));
          } else {
            setProgress(newProgress);
          }
        }
      );
    } catch (error) {
      setProgress(prev => ({
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Import Games</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Platform Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your chess platform username"
            disabled={progress.status === 'importing'}
          />
        </div>

        <GameImportForm
          onSubmit={handleImport}
          isLoading={progress.status === 'importing'}
        />
      </div>

      {progress.status !== 'idle' && (
        <ImportProgress progress={progress} />
      )}
    </div>
  );
}; 