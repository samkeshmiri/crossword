import { useState, useEffect } from 'react';
import { Container, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import Crossword from './components/Crossword';
// Sample puzzle data
// TODO update samplePuzzle to match a schema in which Crossword.tsx can use it
const samplePuzzle = {
  size: 5,
  clues: {
    across: [
      { number: 1, clue: "Wetland area", answer: "SWAMP", direction: 'across' as const },
      { number: 4, clue: "Work or toil", answer: "LABOR", direction: 'across' as const },
      { number: 6, clue: "By oneself", answer: "ALONE", direction: 'across' as const },
      { number: 8, clue: "Promiscuous people", answer: "SLUTS", direction: 'across' as const },
      { number: 10, clue: "Strongly dislikes", answer: "HATES", direction: 'across' as const },
    ],
    down: [
      { number: 1, clue: "Opposite of fast", answer: "SLASH", direction: 'down' as const },
      { number: 2, clue: "To move through water", answer: "WATER", direction: 'down' as const },
      { number: 3, clue: "Not off", answer: "ABOUT", direction: 'down' as const },
      { number: 4, clue: "Not out", answer: "MONEY", direction: 'down' as const },
      { number: 5, clue: "Not in", answer: "PRESS", direction: 'down' as const },
    ],
  },
};

// Import Clue type from ClueList
import type { Clue } from './types';

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
      // For simplicity, assume clues are placed in order and answers are contiguous
      // (A real crossword would need a mapping of clue to grid positions)
      // Here, we just match by number for demo purposes
      if (clue.number === (row + 1) || clue.number === (col + 1)) {
        return clue;
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
              size={samplePuzzle.size} 
              clues={samplePuzzle.clues}
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
