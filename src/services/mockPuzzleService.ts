import type { PuzzleService } from './types';
import type { MiniCrosswordPuzzle } from '../../types';

// Sample puzzle data
const samplePuzzle: MiniCrosswordPuzzle = {
  date: "2025-01-20",
  puzzle_id: "sample-mini-1",
  title: "Sample Mini Crossword",
  size: {
    rows: 5,
    cols: 5
  },
  grid: [
    ["S", "W", "A", "M", "P"],
    ["L", "A", "B", "O", "R"],
    ["A", "L", "O", "N", "E"],
    ["S", "L", "U", "T", "S"],
    ["H", "A", "T", "E", "S"]
  ],
  clues: {
    across: [
      { number: 1, clue: "Wetland area", row: 0, col: 0, length: 5, answer: "SWAMP" },
      { number: 4, clue: "Work or toil", row: 1, col: 0, length: 5, answer: "LABOR" },
      { number: 6, clue: "By oneself", row: 2, col: 0, length: 5, answer: "ALONE" },
      { number: 8, clue: "Promiscuous people", row: 3, col: 0, length: 5, answer: "SLUTS" },
      { number: 10, clue: "Strongly dislikes", row: 4, col: 0, length: 5, answer: "HATES" },
    ],
    down: [
      { number: 1, clue: "Opposite of fast", row: 0, col: 0, length: 5, answer: "SLASH" },
      { number: 2, clue: "To move through water", row: 0, col: 1, length: 5, answer: "WALLA" },
      { number: 3, clue: "Not off", row: 0, col: 2, length: 5, answer: "ABOUT" },
      { number: 4, clue: "A Spanish game", row: 0, col: 3, length: 5, answer: "MONTE" },
      { number: 5, clue: "Irish cupboard", row: 0, col: 4, length: 5, answer: "PRESS" },
    ],
  },
};

export class MockPuzzleService implements PuzzleService {
  async getPuzzle(puzzleId: string): Promise<MiniCrosswordPuzzle> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50));
    return samplePuzzle;
  }

  async getDailyPuzzle(): Promise<MiniCrosswordPuzzle> {
    return this.getPuzzle('daily');
  }
} 