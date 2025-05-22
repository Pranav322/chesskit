export interface Folder {
  id: number;
  name: string;
  description?: string;
  parentId?: number; // For nested folders (optional feature)
  createdAt: Date;
  updatedAt: Date;
}

export interface GameFolder {
  id: number;
  gameId: number;
  folderId: number;
}
