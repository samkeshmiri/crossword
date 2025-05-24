import React, { useState, useEffect } from 'react';
import { Box, Grid, TextField, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

interface Cell {
  value: string;
  number?: number;
  isBlack: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
}

interface Clue {
  number: number;
  clue: string;
  answer: string;
  direction: 'across' | 'down';
}

interface CrosswordProps {
  size: number;
  clues: {
    across: Clue[];
    down: Clue[];
  };
}

const CellInput = styled(TextField)(({ theme }) => ({
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

const Crossword: React.FC<CrosswordProps> = ({ size, clues }) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const inputRefs = React.useRef<(HTMLInputElement | null)[][]>([]);

  useEffect(() => {
    // Initialize empty grid
    const newGrid: Cell[][] = Array(size).fill(null).map(() =>
      Array(size).fill(null).map(() => ({
        value: '',
        isBlack: false,
        isSelected: false,
        isHighlighted: false,
      }))
    );
    setGrid(newGrid);
    // Initialize refs array
    inputRefs.current = Array(size).fill(null).map(() => Array(size).fill(null));
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
      for (let c = 0; c < size; c++) {
        if (!newGrid[row][c].isBlack) {
          newGrid[row][c].isHighlighted = true;
        }
      }
    } else {
      for (let r = 0; r < size; r++) {
        if (!newGrid[r][col].isBlack) {
          newGrid[r][col].isHighlighted = true;
        }
      }
    }

    setGrid(newGrid);
    
    // Focus the input field and select text if present
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

  const handleKeyPress = (event: React.KeyboardEvent, row: number, col: number) => {
    if (!selectedCell) return;

    const [selectedRow, selectedCol] = selectedCell;
    let nextRow = selectedRow;
    let nextCol = selectedCol;

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      setDirection('across');
      nextCol = event.key === 'ArrowRight' ? selectedCol + 1 : selectedCol - 1;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      setDirection('down');
      nextRow = event.key === 'ArrowDown' ? selectedRow + 1 : selectedRow - 1;
    }

    if (nextRow >= 0 && nextRow < size && nextCol >= 0 && nextCol < size && !grid[nextRow][nextCol].isBlack) {
      handleCellClick(nextRow, nextCol);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', p: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`,
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

                      // Move to next cell if a letter was entered or if cell already had text
                      if (newValue || cell.value) {
                        let nextRow = rowIndex;
                        let nextCol = colIndex;
                        let foundEmpty = false;

                        // First try to find an empty cell in the current direction
                        if (direction === 'across') {
                          for (let c = colIndex + 1; c < size; c++) {
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
                          for (let r = rowIndex + 1; r < size; r++) {
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
                        while (nextRow < size && nextCol < size) {
                          if (!grid[nextRow][nextCol].isBlack) {
                            handleCellClick(nextRow, nextCol);
                            break;
                          }
                          if (direction === 'across') {
                            nextCol++;
                            if (nextCol >= size) {
                              nextCol = 0;
                              nextRow++;
                            }
                          } else {
                            nextRow++;
                            if (nextRow >= size) {
                              nextRow = 0;
                              nextCol++;
                            }
                          }
                        }
                      }
                    }}
                    onKeyDown={(e) => handleKeyPress(e, rowIndex, colIndex)}
                    inputProps={{
                      maxLength: 1,
                      style: { textAlign: 'center' },
                    }}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </Box>
              )}
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Crossword; 