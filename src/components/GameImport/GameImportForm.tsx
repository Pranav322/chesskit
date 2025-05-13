import React, { useState } from 'react';
import { GameOrigin } from '@/types/enums';
import { GameImportOptions } from '@/types/importedGame';

const gameCountOptions = [50, 100, 200] as const;

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
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Platform</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as GameOrigin)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value={GameOrigin.Lichess}>Lichess</option>
          <option value={GameOrigin.ChessCom}>Chess.com</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Number of Games</label>
        <select
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        >
          {gameCountOptions.map((option) => (
            <option key={option} value={option}>
              Last {option} Games
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoTag"
          checked={autoTag}
          onChange={(e) => setAutoTag(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          disabled={isLoading}
        />
        <label htmlFor="autoTag" className="text-sm text-gray-700">
          Auto-tag games (opening, date, platform)
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="backgroundImport"
          checked={backgroundImport}
          onChange={(e) => setBackgroundImport(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          disabled={isLoading}
        />
        <label htmlFor="backgroundImport" className="text-sm text-gray-700">
          Import in background
        </label>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? 'Importing...' : 'Import Games'}
      </button>
    </form>
  );
}; 