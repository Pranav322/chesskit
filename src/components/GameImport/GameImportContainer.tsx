import React, { useState } from 'react';
import { GameImportForm } from './GameImportForm';
import { ImportProgress } from './ImportProgress';
import { GameImportOptions, ImportProgress as ImportProgressType } from '@/types/importedGame';
import { useAuth } from '@/contexts/AuthContext';
import { GameImportService } from '@/lib/services/gameImportService';
import { Icon } from '@iconify/react';

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
    <div className="space-y-10">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-sm">
          <div className="flex items-center justify-center mb-6">
            <Icon icon="mdi:chess" className="text-3xl text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Platform Details</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-base font-medium text-gray-700 mb-2">
                Chess Platform Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                  placeholder="Enter your username"
                  disabled={progress.status === 'importing'}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <Icon icon="mdi:account" className="text-2xl text-gray-400" />
                </div>
              </div>
            </div>
            <GameImportForm
              onSubmit={handleImport}
              isLoading={progress.status === 'importing'}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-center mb-6">
            <Icon icon="mdi:progress-check" className="text-3xl text-green-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Import Progress</h2>
          </div>
          {progress.status !== 'idle' && (
            <div className="mt-4">
              <ImportProgress progress={progress} />
            </div>
          )}
          {progress.status === 'idle' && (
            <div className="text-center py-12 text-gray-500">
              <Icon icon="mdi:information" className="text-5xl mx-auto mb-4" />
              <p className="text-lg">Enter your username and configure import settings to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 