import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import type { MiniCrosswordPuzzle } from '../../types';
import ErrorBar from './ErrorBar';
import SuccessBar from './SuccessBar';
import CrosswordCell from './CrosswordCell';
import { isGridComplete, validateAnswers } from '../utils/crosswordUtils';

interface Cell {
  value: string;
  number?: number;
  isBlack: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
}

interface CrosswordProps {
  puzzle: MiniCrosswordPuzzle;
  selectedCell: [number, number] | null;
  setSelectedCell: (cell: [number, number]) => void;
  direction: 'across' | 'down';
  setDirection: (dir: 'across' | 'down') => void;
}

const Crossword: React.FC<CrosswordProps> = ({ puzzle, selectedCell, setSelectedCell, direction, setDirection }) => {
  const { size, clues } = puzzle;
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[][]>([]);

  useEffect(() => {
    // Initialize empty grid
    const newGrid: Cell[][] = Array(size.rows).fill(null).map(() =>
      Array(size.cols).fill(null).map(() => ({
        value: '',
        isBlack: false,
        isSelected: false,
        isHighlighted: false,
      }))
    );
    setGrid(newGrid);
    // Initialize refs array
    inputRefs.current = Array(size.rows).fill(null).map(() => Array(size.cols).fill(null));
  }, [size]);

  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col].isBlack) return;
    
    // Check if clicking on the same cell that's already selected
    const isSameCell = selectedCell && selectedCell[0] === row && selectedCell[1] === col;
    
    if (isSameCell) {
      // Toggle direction when clicking the same cell
      const newDirection = direction === 'across' ? 'down' : 'across';
      setDirection(newDirection);
      
      // Update highlighting for the new direction
      const newGrid = grid.map(row => row.map(cell => ({
        ...cell,
        isSelected: false,
        isHighlighted: false,
      })));
      newGrid[row][col].isSelected = true;
      
      // Highlight cells in the new direction
      if (newDirection === 'across') {
        for (let c = 0; c < size.cols; c++) {
          if (!newGrid[row][c].isBlack) {
            newGrid[row][c].isHighlighted = true;
          }
        }
      } else {
        for (let r = 0; r < size.rows; r++) {
          if (!newGrid[r][col].isBlack) {
            newGrid[r][col].isHighlighted = true;
          }
        }
      }
      setGrid(newGrid);
    } else {
      // Different cell clicked - set new selection but keep same direction
      selectCell(row, col);
    }
    
    setTimeout(() => {
      const input = inputRefs.current[row][col];
      if (input) {
        input.focus();
        if (grid[row][col].value) {
          input.select();
        }
      }
    }, 0);
  };

  // Separate function for programmatic cell selection (doesn't change direction)
  const selectCell = (row: number, col: number) => {
    const newGrid = grid.map(row => row.map(cell => ({
      ...cell,
      isSelected: false,
      isHighlighted: false,
    })));
    newGrid[row][col].isSelected = true;
    setSelectedCell([row, col]);
    
    // Highlight cells in the current direction
    if (direction === 'across') {
      for (let c = 0; c < size.cols; c++) {
        if (!newGrid[row][c].isBlack) {
          newGrid[row][c].isHighlighted = true;
        }
      }
    } else {
      for (let r = 0; r < size.rows; r++) {
        if (!newGrid[r][col].isBlack) {
          newGrid[r][col].isHighlighted = true;
        }
      }
    }
    setGrid(newGrid);
    
    setTimeout(() => {
      const input = inputRefs.current[row][col];
      if (input) {
        input.focus();
        if (grid[row][col].value) {
          input.select();
        }
      }
    }, 0);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (!selectedCell) return;
    const [selectedRow, selectedCol] = selectedCell;
    let nextRow = selectedRow;
    let nextCol = selectedCol;

    if (event.key === 'Backspace' && !grid[selectedRow][selectedCol].value) {
      // Move to previous cell when backspace is pressed on empty cell
      if (direction === 'across') {
        nextCol = selectedCol - 1;
        if (nextCol < 0) {
          nextCol = size.cols - 1;
          nextRow = selectedRow - 1;
        }
      } else {
        nextRow = selectedRow - 1;
        if (nextRow < 0) {
          nextRow = size.rows - 1;
          nextCol = selectedCol - 1;
        }
      }
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      setDirection('across');
      nextCol = event.key === 'ArrowRight' ? selectedCol + 1 : selectedCol - 1;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      setDirection('down');
      nextRow = event.key === 'ArrowDown' ? selectedRow + 1 : selectedRow - 1;
    }

    if (nextRow >= 0 && nextRow < size.rows && nextCol >= 0 && nextCol < size.cols && !grid[nextRow][nextCol].isBlack) {
      selectCell(nextRow, nextCol);
    }
  };

  // Function to check completion and validation
  const checkPuzzleCompletion = (newGrid: Cell[][]) => {
    const isComplete = isGridComplete(newGrid, size);
    
    if (isComplete) {
      const isValid = validateAnswers(newGrid, clues, size);
      setShowErrorBanner(!isValid);
      setShowSuccessBanner(isValid);
    } else {
      // Hide the banners if the grid is no longer complete
      setShowErrorBanner(false);
      setShowSuccessBanner(false);
    }
  };

  const handleCellChange = (rowIndex: number, colIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(-1).toUpperCase();
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex].value = newValue;
    setGrid(newGrid);

    // Check puzzle completion after updating the grid
    checkPuzzleCompletion(newGrid);

    // Move to next cell if a letter was entered or if cell already had text
    if (newValue || grid[rowIndex][colIndex].value) {
      let nextRow = rowIndex;
      let nextCol = colIndex;
      let foundEmpty = false;

      // First try to find an empty cell in the current direction
      if (direction === 'across') {
        for (let c = colIndex + 1; c < size.cols; c++) {
          if (!grid[rowIndex][c].isBlack && !grid[rowIndex][c].value) {
            nextCol = c;
            foundEmpty = true;
            break;
          }
        }
        if (!foundEmpty) {
          // If no empty cells found, move to next row
          nextRow = rowIndex + 1;
          nextCol = 0;
        }
      } else {
        for (let r = rowIndex + 1; r < size.rows; r++) {
          if (!grid[r][colIndex].isBlack && !grid[r][colIndex].value) {
            nextRow = r;
            foundEmpty = true;
            break;
          }
        }
        if (!foundEmpty) {
          // If no empty cells found, move to next column
          nextRow = 0;
          nextCol = colIndex + 1;
        }
      }

      // Find the next valid cell (skip black cells)
      while (nextRow < size.rows && nextCol < size.cols) {
        if (!grid[nextRow][nextCol].isBlack) {
          selectCell(nextRow, nextCol);
          break;
        }
        if (direction === 'across') {
          nextCol++;
          if (nextCol >= size.cols) {
            nextCol = 0;
            nextRow++;
          }
        } else {
          nextRow++;
          if (nextRow >= size.rows) {
            nextRow = 0;
            nextCol++;
          }
        }
      }
    }
  };

  return (
    <>
      <Box sx={{ maxWidth: 400, margin: 'auto', p: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${size.cols}, 1fr)`,
            gridTemplateRows: `repeat(${size.rows}, 1fr)`,
            gap: 1,
            width: '100%',
            aspectRatio: '1 / 1',
            background: '#ccc',
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <CrosswordCell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                rowIndex={rowIndex}
                colIndex={colIndex}
                onCellClick={handleCellClick}
                inputRef={(el) => {
                  inputRefs.current[rowIndex][colIndex] = el;
                }}
                onFocus={(e) => {
                  if (cell.value) {
                    e.target.select();
                  }
                }}
                onChange={(e) => handleCellChange(rowIndex, colIndex, e)}
                onKeyDown={handleKeyPress}
              />
            ))
          )}
        </Box>
      </Box>
      
      <ErrorBar open={showErrorBanner} />
      <SuccessBar open={showSuccessBanner} />
    </>
  );
};

export default Crossword; 