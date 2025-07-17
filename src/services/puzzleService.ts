import type { PuzzleService } from './types';
import type { MiniCrosswordPuzzle } from '../../types';

export class PuzzleService implements PuzzleService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getPuzzle(puzzleId: string): Promise<MiniCrosswordPuzzle> {
    const response = await fetch(`${this.baseUrl}/puzzles/${puzzleId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch puzzle');
    }
    return response.json();
  }

  async getDailyPuzzle(): Promise<MiniCrosswordPuzzle> {
    const response = await fetch(`${this.baseUrl}/puzzles/daily`);
    if (!response.ok) {
      throw new Error('Failed to fetch daily puzzle');
    }
    return response.json();
  }
} 