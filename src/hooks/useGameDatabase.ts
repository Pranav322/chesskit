import { formatGameToDatabase } from "@/lib/chess";
import { GameEval } from "@/types/eval";
import { Game } from "@/types/game";
import { Folder, GameFolder } from "@/types/folder";
import { Chess } from "chess.js";
import { openDB, DBSchema, IDBPDatabase } from "idb";
import { atom, useAtom } from "jotai";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface GameDatabaseSchema extends DBSchema {
  games: {
    value: Game;
    key: number;
  };
  folders: {
    value: Folder;
    key: number;
    indexes: { 'by-parent': number };
  };
  gameFolders: {
    value: GameFolder;
    key: string; // Composite key "gameId:folderId"
    indexes: { 'by-game': number; 'by-folder': number };
  };
}

const gamesAtom = atom<Game[]>([]);
const foldersAtom = atom<Folder[]>([]);
const fetchGamesAtom = atom<boolean>(false);

export const useGameDatabase = (shouldFetchGames?: boolean) => {
  const [db, setDb] = useState<IDBPDatabase<GameDatabaseSchema> | null>(null);
  const [games, setGames] = useAtom(gamesAtom);
  const [folders, setFolders] = useAtom(foldersAtom);
  const [fetchGames, setFetchGames] = useAtom(fetchGamesAtom);
  const [gameFromUrl, setGameFromUrl] = useState<Game | undefined>(undefined);
  const { user } = useAuth();

  useEffect(() => {
    if (shouldFetchGames !== undefined) {
      setFetchGames(shouldFetchGames);
    }
  }, [shouldFetchGames, setFetchGames]);

  useEffect(() => {
    const initDatabase = async () => {
      const db = await openDB<GameDatabaseSchema>("games", 2, {
        upgrade(db, oldVersion) {
          // Create games store if it doesn't exist
          if (!db.objectStoreNames.contains('games')) {
            db.createObjectStore("games", { keyPath: "id", autoIncrement: true });
          }

          // Create folders store if upgrading from v1 or new install
          if (oldVersion < 2) {
            const folderStore = db.createObjectStore("folders", { 
              keyPath: "id", 
              autoIncrement: true 
            });
            folderStore.createIndex('by-parent', 'parentId');

            const gameFoldersStore = db.createObjectStore("gameFolders", {
              keyPath: "id",
              autoIncrement: true
            });
            gameFoldersStore.createIndex('by-game', 'gameId');
            gameFoldersStore.createIndex('by-folder', 'folderId');
          }
        },
      });
      setDb(db);
    };

    initDatabase();
  }, []);

  const loadGames = useCallback(async () => {
    if (db && fetchGames) {
      const games = await db.getAll("games");
      setGames(games);
    }
  }, [db, fetchGames, setGames]);

  const loadFolders = useCallback(async () => {
    if (db) {
      const folders = await db.getAll("folders");
      setFolders(folders);
    }
  }, [db, setFolders]);

  useEffect(() => {
    loadGames();
    loadFolders();
  }, [loadGames, loadFolders]);

  // Folder operations
  const createFolder = useCallback(async (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!db) throw new Error("Database not initialized");
    
    const now = new Date();
    const newFolder: Omit<Folder, 'id'> = {
      ...folder,
      createdAt: now,
      updatedAt: now
    };
    
    const id = await db.add("folders", newFolder as Folder);
    loadFolders();
    return id;
  }, [db, loadFolders]);

  const updateFolder = useCallback(async (id: number, updates: Partial<Folder>) => {
    if (!db) throw new Error("Database not initialized");
    
    const folder = await db.get("folders", id);
    if (!folder) throw new Error("Folder not found");
    
    const updatedFolder = {
      ...folder,
      ...updates,
      updatedAt: new Date()
    };
    
    await db.put("folders", updatedFolder);
    loadFolders();
  }, [db, loadFolders]);

  const deleteFolder = useCallback(async (id: number) => {
    if (!db) throw new Error("Database not initialized");
    
    // Delete the folder
    await db.delete("folders", id);
    
    // Delete all game associations with this folder
    const tx = db.transaction("gameFolders", "readwrite");
    const gameAssociations = await tx.store.index('by-folder').getAll(id);
    await Promise.all(gameAssociations.map(assoc => tx.store.delete(assoc.id)));
    await tx.done;
    
    loadFolders();
  }, [db, loadFolders]);

  // Game-Folder operations
  const moveGamesToFolder = useCallback(async (gameIds: number[], folderId: number) => {
    if (!db) throw new Error("Database not initialized");
    
    const tx = db.transaction("gameFolders", "readwrite");
    
    // Remove existing folder assignments for these games
    for (const gameId of gameIds) {
      const existingAssocs = await tx.store.index('by-game').getAll(gameId);
      await Promise.all(existingAssocs.map(assoc => tx.store.delete(assoc.id)));
    }
    
    // Add new folder assignments
    await Promise.all(gameIds.map(gameId => 
      tx.store.add({
        gameId,
        folderId
      })
    ));
    
    await tx.done;
  }, [db]);

  const getGameFolders = useCallback(async (gameId: number): Promise<number[]> => {
    if (!db) return [];
    
    const associations = await db.getAllFromIndex("gameFolders", "by-game", gameId);
    return associations.map(assoc => assoc.folderId);
  }, [db]);

  const getFolderGames = useCallback(async (folderId: number): Promise<number[]> => {
    if (!db) return [];
    
    const associations = await db.getAllFromIndex("gameFolders", "by-folder", folderId);
    return associations.map(assoc => assoc.gameId);
  }, [db]);

  const getUserGames = useCallback(async (_userId: string) => {
    if (!db) throw new Error("Database not initialized");
    if (!user) throw new Error("User not authenticated");
    
    const games = await db.getAll("games");
    
    // Ensure all required properties exist
    return games.map(game => ({
      ...game,
      result: game.result || '?',
      white: game.white || { name: 'White' },
      black: game.black || { name: 'Black' },
      metadata: game.metadata || { white: game.white || { name: 'White' }, black: game.black || { name: 'Black' } }
    }));
  }, [db, user]);

  const addGame = useCallback(
    async (game: Chess) => {
      if (!db) throw new Error("Database not initialized");

      const gameToAdd = formatGameToDatabase(game);
      const gameId = await db.add("games", gameToAdd as Game);

      loadGames();

      return gameId;
    },
    [db, loadGames]
  );

  const updateGame = useCallback(
    async (gameId: number, updatedGame: Game) => {
      if (!db) throw new Error("Database not initialized");

      await db.put("games", updatedGame);
      loadGames();
    },
    [db, loadGames]
  );

  const setGameEval = useCallback(
    async (gameId: number, evaluation: GameEval) => {
      if (!db) throw new Error("Database not initialized");

      const game = await db.get("games", gameId);
      if (!game) throw new Error("Game not found");

      await db.put("games", { ...game, eval: evaluation });

      loadGames();
    },
    [db, loadGames]
  );

  const getGame = useCallback(
    async (gameId: number) => {
      if (!db) return undefined;

      return db.get("games", gameId);
    },
    [db]
  );

  const deleteGame = useCallback(
    async (gameId: number) => {
      if (!db) throw new Error("Database not initialized");

      await db.delete("games", gameId);

      loadGames();
    },
    [db, loadGames]
  );

  const router = useRouter();
  const { gameId } = router.query;

  useEffect(() => {
    switch (typeof gameId) {
      case "string":
        getGame(parseInt(gameId)).then((game) => {
          setGameFromUrl(game);
        });
        break;
      default:
        setGameFromUrl(undefined);
    }
  }, [gameId, setGameFromUrl, getGame]);

  const isReady = db !== null;

  return {
    addGame,
    updateGame,
    setGameEval,
    getGame,
    deleteGame,
    getUserGames,
    games,
    isReady,
    gameFromUrl,
    // Add folder-related functions
    folders,
    createFolder,
    updateFolder,
    deleteFolder,
    moveGamesToFolder,
    getGameFolders,
    getFolderGames,
  };
};
