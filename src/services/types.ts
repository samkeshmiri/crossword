import type { MiniCrosswordPuzzle } from '../../types';

export interface PuzzleService {
  getPuzzle: (puzzleId: string) => Promise<MiniCrosswordPuzzle>;
  getDailyPuzzle: () => Promise<MiniCrosswordPuzzle>;
} 