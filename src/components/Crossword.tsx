import React, { useState, useEffect } from 'react';
import { Box, Switch, FormControlLabel } from '@mui/material';
import type { MiniCrosswordPuzzle } from '../../types';
import ErrorBar from './ErrorBar';
import SuccessBar from './SuccessBar';
import CrosswordCell from './CrosswordCell';
import { isGridComplete, validateAnswers, getCorrectCharForCell } from '../utils/crosswordUtils';
import logger from '../utils/logger';

interface Cell {
  value: string;
  number?: number;
  isBlack: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isIncorrect?: boolean;
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
  const [isValidationEnabled, setIsValidationEnabled] = useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[][]>([]);

  // Log puzzle initialization
  useEffect(() => {
    logger.puzzleInit(puzzle);
  }, [puzzle]);

  useEffect(() => {
    // Initialize empty grid
    const newGrid: Cell[][] = Array(size.rows).fill(null).map(() =>
      Array(size.cols).fill(null).map(() => ({
        value: '',
        isBlack: false,
        isSelected: false,
        isHighlighted: false,
        isIncorrect: false,
      }))
    );
    setGrid(newGrid);
    // Initialize refs array
    inputRefs.current = Array(size.rows).fill(null).map(() => Array(size.cols).fill(null));
  }, [size]);

  // Function to update validation state for all cells
  const updateValidationState = (gridToUpdate: Cell[][]) => {
    if (!isValidationEnabled) {
      // Clear all incorrect markings when validation is disabled
      return gridToUpdate.map(row => row.map(cell => ({
        ...cell,
        isIncorrect: false,
      })));
    }

    return gridToUpdate.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (cell.isBlack || !cell.value) {
          return { ...cell, isIncorrect: false };
        }
        
        const correctChar = getCorrectCharForCell(rowIndex, colIndex, clues);
        const isIncorrect = correctChar !== null && cell.value !== correctChar;
        
        return { ...cell, isIncorrect };
      })
    );
  };

  // Update validation when toggle changes
  useEffect(() => {
    logger.validationToggle(isValidationEnabled);
    setGrid(prevGrid => updateValidationState(prevGrid));
  }, [isValidationEnabled, clues]);

  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col].isBlack) {
      logger.debug('INTERACTION', `Clicked on black cell at (${row}, ${col}) - ignoring`);
      return;
    }
    
    // Check if clicking on the same cell that's already selected
    const isSameCell = selectedCell && selectedCell[0] === row && selectedCell[1] === col;
    
    logger.cellClick(row, col, direction, isSameCell || false);
    
    if (isSameCell) {
      // Toggle direction when clicking the same cell
      const newDirection = direction === 'across' ? 'down' : 'across';
      logger.directionChange(direction, newDirection, 'cell_click');
      setDirection(newDirection);
      
      // Update highlighting for the new direction
      const newGrid = grid.map(gridRow => gridRow.map(cell => ({
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
      
      // Apply validation state while preserving selection/highlighting
      const validatedGrid = updateValidationState(newGrid);
      setGrid(validatedGrid);
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
    logger.debug('SELECTION', `Selecting cell (${row}, ${col})`, {
      previousCell: selectedCell,
      direction,
      highlightDirection: direction
    });
    
    const newGrid = grid.map(gridRow => gridRow.map(cell => ({
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
    
    // Apply validation state while preserving selection/highlighting
    const validatedGrid = updateValidationState(newGrid);
    setGrid(validatedGrid);
    
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
    
    logger.keyPress(event.key, selectedCell, direction);
    
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
      if (direction !== 'across') {
        logger.directionChange(direction, 'across', 'arrow_key');
      }
      setDirection('across');
      nextCol = event.key === 'ArrowRight' ? selectedCol + 1 : selectedCol - 1;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (direction !== 'down') {
        logger.directionChange(direction, 'down', 'arrow_key');
      }
      setDirection('down');
      nextRow = event.key === 'ArrowDown' ? selectedRow + 1 : selectedRow - 1;
    }

    if (nextRow >= 0 && nextRow < size.rows && nextCol >= 0 && nextCol < size.cols && !grid[nextRow][nextCol].isBlack) {
      logger.debug('NAVIGATION', `Moving from (${selectedRow}, ${selectedCol}) to (${nextRow}, ${nextCol})`, {
        trigger: event.key,
        direction
      });
      selectCell(nextRow, nextCol);
    } else {
      logger.debug('NAVIGATION', `Cannot move from (${selectedRow}, ${selectedCol}) - boundary reached`, {
        attempted: [nextRow, nextCol],
        trigger: event.key,
        direction
      });
    }
  };

  // Function to check completion and validation
  const checkPuzzleCompletion = (newGrid: Cell[][]) => {
    const isComplete = isGridComplete(newGrid, size);
    
    if (isComplete) {
      const isValid = validateAnswers(newGrid, clues, size);
      logger.gridComplete(true, isValid);
      setShowErrorBanner(!isValid);
      setShowSuccessBanner(isValid);
    } else {
      // Hide the banners if the grid is no longer complete
      if (showErrorBanner || showSuccessBanner) {
        logger.gridComplete(false);
      }
      setShowErrorBanner(false);
      setShowSuccessBanner(false);
    }
  };

  const handleCellChange = (rowIndex: number, colIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(-1).toUpperCase();
    const oldValue = grid[rowIndex][colIndex].value;
    
    logger.cellChange(rowIndex, colIndex, oldValue, newValue);
    
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex].value = newValue;
    
    // Apply validation state to all cells if validation is enabled
    const validatedGrid = updateValidationState(newGrid);
    setGrid(validatedGrid);

    // Check puzzle completion after updating the grid
    checkPuzzleCompletion(validatedGrid);

    // Move to next cell if a letter was entered or if cell already had text
    if (newValue || grid[rowIndex][colIndex].value) {
      let nextRow = rowIndex;
      let nextCol = colIndex;
      let foundEmpty = false;

      // First try to find an empty cell in the current direction
      if (direction === 'across') {
        for (let c = colIndex + 1; c < size.cols; c++) {
          if (!validatedGrid[rowIndex][c].isBlack && !validatedGrid[rowIndex][c].value) {
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
          if (!validatedGrid[r][colIndex].isBlack && !validatedGrid[r][colIndex].value) {
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
        if (!validatedGrid[nextRow][nextCol].isBlack) {
          logger.debug('AUTO_NAVIGATION', `Auto-moving after letter entry from (${rowIndex}, ${colIndex}) to (${nextRow}, ${nextCol})`, {
            direction,
            foundEmpty,
            newValue
          });
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
      {/* Validation Toggle Button in very top right corner */}
      <Box sx={{ 
        position: 'fixed', 
        top: 16, 
        right: 16, 
        zIndex: 1000 
      }}>
        <FormControlLabel
          control={
            <Switch 
              checked={isValidationEnabled}
              onChange={(e) => setIsValidationEnabled(e.target.checked)}
              size="small"
            />
          }
          label="Check Answers"
          sx={{ 
            fontSize: '0.75rem',
            '& .MuiFormControlLabel-label': {
              fontSize: '0.75rem'
            }
          }}
        />
      </Box>

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