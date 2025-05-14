interface DuplicateGameHandlers {
  onSkip: () => void;
  onOverwrite: () => void;
  onImportAsNew: () => void;
}

declare global {
  interface Window {
    duplicateGameHandlers?: DuplicateGameHandlers;
  }
}

export {}; 