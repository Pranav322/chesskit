import React, { useState } from 'react';
import { GameOrigin } from '@/types/enums';
import { GameImportOptions } from '@/types/importedGame';
import { Icon } from '@iconify/react';

const gameCountOptions = [50, 100, 200, 500] as const;

export const GameImportForm: React.FC<{
  onSubmit: (options: GameImportOptions) => void;
  isLoading?: boolean;
}> = ({ onSubmit, isLoading }) => {
  const [platform, setPlatform] = useState<GameOrigin>(GameOrigin.Lichess);
  const [count, setCount] = useState<typeof gameCountOptions[number]>(100);
  const [autoTag, setAutoTag] = useState(true);
  const [backgroundImport, setBackgroundImport] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      platform,
      count,
      autoTag,
      backgroundImport,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div>
          <label className="block text-base font-medium text-gray-700 mb-3">
            Select Chess Platform
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPlatform(GameOrigin.Lichess)}
              className={`flex items-center justify-center px-6 py-4 border-2 rounded-xl ${
                platform === GameOrigin.Lichess
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-50'
              } transition-all duration-200`}
              disabled={isLoading}
            >
              <Icon icon="simple-icons:lichess" className="text-2xl mr-3" />
              <span className="text-lg font-medium">Lichess</span>
            </button>
            <button
              type="button"
              onClick={() => setPlatform(GameOrigin.ChessCom)}
              className={`flex items-center justify-center px-6 py-4 border-2 rounded-xl ${
                platform === GameOrigin.ChessCom
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-50'
              } transition-all duration-200`}
              disabled={isLoading}
            >
              <Icon icon="simple-icons:chess-dot-com" className="text-2xl mr-3" />
              <span className="text-lg font-medium">Chess.com</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-3">
            Number of Games to Import
          </label>
          <div className="relative">
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white appearance-none pr-12 transition-all duration-200"
              disabled={isLoading}
            >
              {gameCountOptions.map((option) => (
                <option key={option} value={option}>
                  Last {option} Games
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <Icon icon="mdi:chevron-down" className="text-2xl text-gray-400" />
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-gray-50 rounded-xl p-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoTag"
              checked={autoTag}
              onChange={(e) => setAutoTag(e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
              disabled={isLoading}
            />
            <label htmlFor="autoTag" className="ml-3 block text-base text-gray-700">
              Auto-tag games (opening, date, platform)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="backgroundImport"
              checked={backgroundImport}
              onChange={(e) => setBackgroundImport(e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
              disabled={isLoading}
            />
            <label htmlFor="backgroundImport" className="ml-3 block text-base text-gray-700">
              Import in background
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex items-center justify-center px-8 py-4 border-2 rounded-xl text-lg font-semibold ${
          isLoading
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-white shadow-sm hover:shadow focus:outline-none focus:ring-4 focus:ring-blue-100'
        } transition-all duration-200`}
      >
        {isLoading ? (
          <>
            <Icon icon="mdi:loading" className="animate-spin text-2xl mr-3" />
            Importing Games...
          </>
        ) : (
          <>
            <Icon icon="mdi:cloud-download" className="text-2xl mr-3" />
            Import Games
          </>
        )}
      </button>
    </form>
  );
}; 