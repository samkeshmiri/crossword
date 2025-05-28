import type { Clue } from '../../types';

interface Cell {
  value: string;
  isBlack: boolean;
}

// Function to check if all cells are filled
export const isGridComplete = (grid: Cell[][], size: { rows: number; cols: number }): boolean => {
  for (let row = 0; row < size.rows; row++) {
    for (let col = 0; col < size.cols; col++) {
      if (!grid[row][col].isBlack && !grid[row][col].value) {
        return false;
      }
    }
  }
  return true;
};

// Function to extract answer from grid for a specific clue
export const extractAnswerFromGrid = (
  grid: Cell[][],
  clue: Clue,
  size: { rows: number; cols: number },
  clues: { across: Clue[]; down: Clue[] }
): string => {
  const answer: string[] = [];
  const { row: startRow, col: startCol, length } = clue;

  // Determine direction based on clue list
  const isAcross = clues.across.includes(clue);
  
  if (isAcross) {
    // Read horizontally from the starting position
    for (let col = startCol; col < size.cols && answer.length < length; col++) {
      if (startRow < size.rows && !grid[startRow][col].isBlack) {
        answer.push(grid[startRow][col].value);
      }
    }
  } else {
    // Read vertically from the starting position
    for (let row = startRow; row < size.rows && answer.length < length; row++) {
      if (startCol < size.cols && !grid[row][startCol].isBlack) {
        answer.push(grid[row][startCol].value);
      }
    }
  }

  return answer.join('');
};

// Function to validate answers
export const validateAnswers = (
  grid: Cell[][],
  clues: { across: Clue[]; down: Clue[] },
  size: { rows: number; cols: number }
): boolean => {
  // Check all across clues
  for (const clue of clues.across) {
    const userAnswer = extractAnswerFromGrid(grid, clue, size, clues);
    if (userAnswer !== clue.answer) {
      console.log(`Mismatch for ${clue.number}-across: expected "${clue.answer}", got "${userAnswer}"`);
      return false;
    }
  }

  // Check all down clues
  for (const clue of clues.down) {
    const userAnswer = extractAnswerFromGrid(grid, clue, size, clues);
    if (userAnswer !== clue.answer) {
      console.log(`Mismatch for ${clue.number}-down: expected "${clue.answer}", got "${userAnswer}"`);
      return false;
    }
  }

  return true;
}; 