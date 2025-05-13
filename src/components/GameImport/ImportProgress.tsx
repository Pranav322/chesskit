import React from 'react';
import { ImportProgress as ImportProgressType } from '@/types/importedGame';
import { Icon } from '@iconify/react';

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

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'importing':
        return <Icon icon="mdi:loading" className="animate-spin text-2xl text-blue-600" />;
      case 'completed':
        return <Icon icon="mdi:check-circle" className="text-2xl text-green-600" />;
      case 'failed':
        return <Icon icon="mdi:alert-circle" className="text-2xl text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <span className="text-lg font-medium text-gray-900">
            {progress.status === 'importing' && 'Importing games...'}
            {progress.status === 'completed' && 'Import completed'}
            {progress.status === 'failed' && 'Import failed'}
          </span>
        </div>
        <span className="text-lg font-semibold text-blue-600">
          {percentage}%
        </span>
      </div>
      
      <div className="relative">
        <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-100">
          <div
            className={`${getStatusColor()} transition-all duration-500 ease-out shadow-sm`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-base font-medium text-gray-500">Total</div>
            <Icon icon="mdi:database" className="text-xl text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{progress.total}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-base font-medium text-green-600">Imported</div>
            <Icon icon="mdi:check-circle" className="text-xl text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-700">{progress.completed}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-base font-medium text-red-600">Failed</div>
            <Icon icon="mdi:alert-circle" className="text-xl text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-700">{progress.failed}</div>
        </div>
      </div>

      {progress.status === 'failed' && progress.error && (
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-red-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Icon icon="mdi:alert-circle" className="text-2xl text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-medium text-red-800 mb-1">Import Failed</h3>
              <p className="text-sm text-red-600">
                {progress.error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 