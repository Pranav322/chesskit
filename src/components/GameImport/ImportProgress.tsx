import React from 'react';
import { ImportProgress as ImportProgressType } from '@/types/importedGame';

export const ImportProgress: React.FC<{
  progress: ImportProgressType;
}> = ({ progress }) => {
  const percentage = progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  const getStatusColor = () => {
    switch (progress.status) {
      case 'importing':
        return 'bg-blue-600';
      case 'completed':
        return 'bg-green-600';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>
          Progress: {progress.completed}/{progress.total} games
        </span>
        <span>{percentage}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${getStatusColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {progress.status === 'failed' && progress.error && (
        <div className="text-sm text-red-600 mt-2">
          Error: {progress.error}
        </div>
      )}

      <div className="flex justify-between text-sm mt-2">
        <span className="text-green-600">{progress.completed} Imported</span>
        <span className="text-red-600">{progress.failed} Failed</span>
      </div>
    </div>
  );
}; 