import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Paper, Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { MiniCrosswordPuzzle, Clue } from '../../types';

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

const CellInput = styled(TextField)(() => ({
  '& .MuiInputBase-input': {
    textAlign: 'center',
    textTransform: 'uppercase',
    fontSize: '2.2rem',
    padding: 0,
    width: '100%',
    height: '100%',
    lineHeight: 1,
    background: 'transparent',
    border: 'none',
    boxSizing: 'border-box',
  },
  '& .MuiOutlinedInput-root': {
    height: '100%',
    background: 'transparent',
    borderRadius: 0,
    boxShadow: 'none',
    '& fieldset': {
      border: 'none',
    },
  },
}));

const Crossword: React.FC<CrosswordProps> = ({ puzzle, selectedCell, setSelectedCell, direction, setDirection }) => {
  const { size, clues } = puzzle;
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
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
    const newGrid = grid.map(row => row.map(cell => ({
      ...cell,
      isSelected: false,
      isHighlighted: false,
    })));
    newGrid[row][col].isSelected = true;
    setSelectedCell([row, col]);
    // Highlight cells in the current word
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
      handleCellClick(nextRow, nextCol);
    }
  };

  // Function to check if all cells are filled
  const isGridComplete = (grid: Cell[][]): boolean => {
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
  const extractAnswerFromGrid = (grid: Cell[][], clue: Clue): string => {
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

  // Function to validate answers dynamically
  const validateAnswers = (grid: Cell[][]): boolean => {
    // Check all across clues
    for (const clue of clues.across) {
      const userAnswer = extractAnswerFromGrid(grid, clue);
      if (userAnswer !== clue.answer) {
        console.log(`Mismatch for ${clue.number}-across: expected "${clue.answer}", got "${userAnswer}"`);
        return false;
      }
    }

    // Check all down clues
    for (const clue of clues.down) {
      const userAnswer = extractAnswerFromGrid(grid, clue);
      if (userAnswer !== clue.answer) {
        console.log(`Mismatch for ${clue.number}-down: expected "${clue.answer}", got "${userAnswer}"`);
        return false;
      }
    }

    return true;
  };

  // Function to check completion and validation
  const checkPuzzleCompletion = (newGrid: Cell[][]) => {
    const isComplete = isGridComplete(newGrid);
    
    if (isComplete) {
      const isValid = validateAnswers(newGrid);
      setShowErrorBanner(!isValid);
    } else {
      // Hide the banner if the grid is no longer complete
      setShowErrorBanner(false);
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
              <Paper
                key={`${rowIndex}-${colIndex}`}
                elevation={cell.isSelected ? 3 : 1}
                sx={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  backgroundColor: cell.isBlack ? 'black' : 'white',
                  cursor: cell.isBlack ? 'default' : 'pointer',
                  minWidth: 0,
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0,
                }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {!cell.isBlack && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: cell.isHighlighted ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
                    }}
                  >
                    {cell.number && (
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          top: 2,
                          left: 2,
                          fontSize: '0.6rem',
                        }}
                      >
                        {cell.number}
                      </Typography>
                    )}
                    <CellInput
                      value={cell.value}
                      inputRef={(el) => {
                        inputRefs.current[rowIndex][colIndex] = el;
                      }}
                      onFocus={(e) => {
                        if (cell.value) {
                          e.target.select();
                        }
                      }}
                      onChange={(e) => {
                        const newValue = e.target.value.slice(-1).toUpperCase();
                        const newGrid = [...grid];
                        newGrid[rowIndex][colIndex].value = newValue;
                        setGrid(newGrid);

                        // Check puzzle completion after updating the grid
                        checkPuzzleCompletion(newGrid);

                        // Move to next cell if a letter was entered or if cell already had text
                        if (newValue || cell.value) {
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
                              handleCellClick(nextRow, nextCol);
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
                      }}
                      onKeyDown={(e) => handleKeyPress(e)}
                      inputProps={{
                        maxLength: 1,
                        style: { textAlign: 'center' },
                      }}
                      variant="outlined"
                      size="small"
                      fullWidth
                      autoComplete="off"
                    />
                  </Box>
                )}
              </Paper>
            ))
          )}
        </Box>
      </Box>
      
      <Snackbar 
        open={showErrorBanner} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          top: '20px !important',
          '& .MuiAlert-root': {
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          }
        }}
      >
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '1rem',
              fontWeight: 'medium',
            }
          }}
        >
          One or more letters incorrect
        </Alert>
      </Snackbar>
    </>
  );
};

export default Crossword; 