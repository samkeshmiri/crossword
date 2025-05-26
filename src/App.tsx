import { useState, useEffect } from 'react';
import { Container, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import Crossword from './components/Crossword';
import type { MiniCrosswordPuzzle, Clue } from '../types';

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
      { number: 2, clue: "To move through water", row: 0, col: 1, length: 5, answer: "WATER" },
      { number: 3, clue: "Not off", row: 0, col: 2, length: 5, answer: "ABOUT" },
      { number: 4, clue: "A Spanish game", row: 0, col: 3, length: 5, answer: "MONTE" },
      { number: 5, clue: "Not in", row: 0, col: 4, length: 5, answer: "PRESS" },
    ],
  },
};

function App() {
  const [seconds, setSeconds] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  function getCurrentClue(
    clues: { across: Clue[]; down: Clue[] },
    selectedCell: [number, number] | null,
    direction: 'across' | 'down'
  ): Clue | null {
    if (!selectedCell) return null;
    const [row, col] = selectedCell;
    // Find the clue whose answer covers the selected cell in the given direction
    const clueList = clues[direction];
    for (const clue of clueList) {
      // Check if the selected cell is within the clue's answer range
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          CWORD
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          {formatTime(seconds)}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
        }}>
          <Box sx={{ 
            flex: isMobile ? '1 1 auto' : '2 1 auto',
            minWidth: 0,
          }}>
            <Crossword 
              puzzle={samplePuzzle}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              direction={direction}
              setDirection={setDirection}
            />
          </Box>
          
          <Box sx={{ 
            flex: isMobile ? '1 1 auto' : '1 1 auto',
            minWidth: isMobile ? 'auto' : 300,
          }}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, minHeight: 80 }}>
              <Typography variant="subtitle1" gutterBottom>Current Clue</Typography>
              <Typography variant="body1">
                {getCurrentClue(samplePuzzle.clues, selectedCell, direction)?.clue || 'Select a cell'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default App;
