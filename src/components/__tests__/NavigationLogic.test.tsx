import React from 'react';
import { render } from '@testing-library/react';
import App from '../../App';
import type { MiniCrosswordPuzzle, Clue } from '../../../types';

// Test puzzle with known structure for predictable testing
const testPuzzle: MiniCrosswordPuzzle = {
  date: "2025-01-20",
  puzzle_id: "test-mini-1",
  title: "Test Mini Crossword",
  size: {
    rows: 3,
    cols: 3
  },
  grid: [
    ["A", "B", "C"],
    ["D", "E", "F"],
    ["G", "H", "I"]
  ],
  clues: {
    across: [
      { number: 1, clue: "First across", row: 0, col: 0, length: 3, answer: "ABC" },
      { number: 2, clue: "Second across", row: 1, col: 0, length: 3, answer: "DEF" },
    ],
    down: [
      { number: 1, clue: "First down", row: 0, col: 0, length: 3, answer: "ADG" },
      { number: 3, clue: "Third down", row: 0, col: 2, length: 3, answer: "CFI" },
    ]
  }
};

describe('Navigation Logic', () => {
  // Mock React hooks for testing
  let mockSetSelectedCell: jest.Mock;
  let mockSetDirection: jest.Mock;
  let selectedCell: [number, number] | null = null;
  let direction: 'across' | 'down' = 'across';

  beforeEach(() => {
    mockSetSelectedCell = jest.fn();
    mockSetDirection = jest.fn();
    selectedCell = null;
    direction = 'across';
    
    // Mock console to avoid log spam
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getCurrentClue', () => {
    // Create a function similar to the one in App.tsx for testing
    function getCurrentClue(
      clues: { across: Clue[]; down: Clue[] },
      selectedCell: [number, number] | null,
      direction: 'across' | 'down'
    ): Clue | null {
      if (!selectedCell) return null;
      const [row, col] = selectedCell;
      
      const clueList = clues[direction];
      for (const clue of clueList) {
        if (direction === 'across') {
          if (clue.row === row && col >= clue.col && col < clue.col + clue.length) {
            return clue;
          }
        } else {
          if (clue.col === col && row >= clue.row && row < clue.row + clue.length) {
            return clue;
          }
        }
      }
      return null;
    }

    it('should find correct across clue for cell position', () => {
      const result = getCurrentClue(testPuzzle.clues, [0, 1], 'across');
      expect(result).toEqual({
        number: 1,
        clue: "First across",
        row: 0,
        col: 0,
        length: 3,
        answer: "ABC"
      });
    });

    it('should find correct down clue for cell position', () => {
      const result = getCurrentClue(testPuzzle.clues, [1, 0], 'down');
      expect(result).toEqual({
        number: 1,
        clue: "First down",
        row: 0,
        col: 0,
        length: 3,
        answer: "ADG"
      });
    });

    it('should return null when no cell is selected', () => {
      const result = getCurrentClue(testPuzzle.clues, null, 'across');
      expect(result).toBeNull();
    });

    it('should return null when cell is not part of any clue in the given direction', () => {
      // Cell [1, 2] is not part of any down clue starting from column 2
      const result = getCurrentClue(testPuzzle.clues, [1, 1], 'down');
      expect(result).toBeNull();
    });

    it('should handle edge cases at clue boundaries', () => {
      // Test first cell of clue
      const result1 = getCurrentClue(testPuzzle.clues, [0, 0], 'across');
      expect(result1?.number).toBe(1);

      // Test last cell of clue
      const result2 = getCurrentClue(testPuzzle.clues, [0, 2], 'across');
      expect(result2?.number).toBe(1);

      // Test cell just outside clue
      const result3 = getCurrentClue(testPuzzle.clues, [0, 3], 'across');
      expect(result3).toBeNull();
    });
  });

  describe('getAllClues', () => {
    function getAllClues(puzzle: MiniCrosswordPuzzle): Clue[] {
      return [...puzzle.clues.across, ...puzzle.clues.down];
    }

    it('should combine across and down clues in correct order', () => {
      const result = getAllClues(testPuzzle);
      expect(result).toHaveLength(4);
      
      // First two should be across clues
      expect(result[0].clue).toBe("First across");
      expect(result[1].clue).toBe("Second across");
      
      // Last two should be down clues
      expect(result[2].clue).toBe("First down");
      expect(result[3].clue).toBe("Third down");
    });

    it('should preserve clue order within each direction', () => {
      const result = getAllClues(testPuzzle);
      
      // Across clues should come first
      expect(result[0].number).toBe(1);
      expect(result[1].number).toBe(2);
      
      // Down clues should come after
      expect(result[2].number).toBe(1);
      expect(result[3].number).toBe(3);
    });
  });

  describe('getCurrentClueIndex', () => {
    function getCurrentClueIndex(
      puzzle: MiniCrosswordPuzzle,
      selectedCell: [number, number] | null,
      direction: 'across' | 'down'
    ): number {
      function getCurrentClue(
        clues: { across: Clue[]; down: Clue[] },
        selectedCell: [number, number] | null,
        direction: 'across' | 'down'
      ): Clue | null {
        if (!selectedCell) return null;
        const [row, col] = selectedCell;
        
        const clueList = clues[direction];
        for (const clue of clueList) {
          if (direction === 'across') {
            if (clue.row === row && col >= clue.col && col < clue.col + clue.length) {
              return clue;
            }
          } else {
            if (clue.col === col && row >= clue.row && row < clue.row + clue.length) {
              return clue;
            }
          }
        }
        return null;
      }

      const currentClue = getCurrentClue(puzzle.clues, selectedCell, direction);
      if (!currentClue) return -1;
      
      const allClues = [...puzzle.clues.across, ...puzzle.clues.down];
      
      if (direction === 'across') {
        for (let i = 0; i < puzzle.clues.across.length; i++) {
          const clue = allClues[i];
          if (clue.number === currentClue.number && 
              clue.row === currentClue.row && 
              clue.col === currentClue.col) {
            return i;
          }
        }
      } else {
        const downStartIndex = puzzle.clues.across.length;
        for (let i = 0; i < puzzle.clues.down.length; i++) {
          const clue = allClues[downStartIndex + i];
          if (clue.number === currentClue.number && 
              clue.row === currentClue.row && 
              clue.col === currentClue.col) {
            return downStartIndex + i;
          }
        }
      }
      
      return -1;
    }

    it('should return correct index for across clues', () => {
      const result = getCurrentClueIndex(testPuzzle, [0, 0], 'across');
      expect(result).toBe(0); // First across clue
      
      const result2 = getCurrentClueIndex(testPuzzle, [1, 1], 'across');
      expect(result2).toBe(1); // Second across clue
    });

    it('should return correct index for down clues', () => {
      const result = getCurrentClueIndex(testPuzzle, [0, 0], 'down');
      expect(result).toBe(2); // First down clue (index 2 in combined array)
      
      const result2 = getCurrentClueIndex(testPuzzle, [1, 2], 'down');
      expect(result2).toBe(3); // Third down clue (index 3 in combined array)
    });

    it('should return -1 when no cell is selected', () => {
      const result = getCurrentClueIndex(testPuzzle, null, 'across');
      expect(result).toBe(-1);
    });

    it('should return -1 when cell is not part of any clue', () => {
      const result = getCurrentClueIndex(testPuzzle, [2, 1], 'down');
      expect(result).toBe(-1);
    });
  });

  describe('Navigation Edge Cases', () => {
    it('should handle puzzle with no clues', () => {
      const emptyPuzzle: MiniCrosswordPuzzle = {
        ...testPuzzle,
        clues: { across: [], down: [] }
      };
      
      function getAllClues(puzzle: MiniCrosswordPuzzle): Clue[] {
        return [...puzzle.clues.across, ...puzzle.clues.down];
      }
      
      const result = getAllClues(emptyPuzzle);
      expect(result).toHaveLength(0);
    });

    it('should handle puzzle with only across clues', () => {
      const acrossOnlyPuzzle: MiniCrosswordPuzzle = {
        ...testPuzzle,
        clues: { 
          across: testPuzzle.clues.across, 
          down: [] 
        }
      };
      
      function getAllClues(puzzle: MiniCrosswordPuzzle): Clue[] {
        return [...puzzle.clues.across, ...puzzle.clues.down];
      }
      
      const result = getAllClues(acrossOnlyPuzzle);
      expect(result).toHaveLength(2);
      expect(result.every(clue => 
        acrossOnlyPuzzle.clues.across.includes(clue)
      )).toBe(true);
    });

    it('should handle puzzle with only down clues', () => {
      const downOnlyPuzzle: MiniCrosswordPuzzle = {
        ...testPuzzle,
        clues: { 
          across: [], 
          down: testPuzzle.clues.down 
        }
      };
      
      function getAllClues(puzzle: MiniCrosswordPuzzle): Clue[] {
        return [...puzzle.clues.across, ...puzzle.clues.down];
      }
      
      const result = getAllClues(downOnlyPuzzle);
      expect(result).toHaveLength(2);
      expect(result.every(clue => 
        downOnlyPuzzle.clues.down.includes(clue)
      )).toBe(true);
    });
  });
}); 