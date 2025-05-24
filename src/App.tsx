import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import Crossword from './components/Crossword';
import ClueList from './components/ClueList';

// Sample puzzle data
const samplePuzzle = {
  size: 5,
  clues: {
    across: [
      { number: 1, clue: "Opposite of 'down'", answer: "UP", direction: 'across' as const },
      { number: 4, clue: "A small amount", answer: "BIT", direction: 'across' as const },
      { number: 6, clue: "To move through water", answer: "SWIM", direction: 'across' as const },
    ],
    down: [
      { number: 1, clue: "To consume food", answer: "EAT", direction: 'down' as const },
      { number: 2, clue: "A small piece", answer: "PART", direction: 'down' as const },
      { number: 3, clue: "To make a mistake", answer: "ERR", direction: 'down' as const },
    ],
  },
};

// Import Clue type from ClueList
import type { Clue } from './types';

function App() {
  const [selectedClue, setSelectedClue] = useState<Clue | undefined>();
  const [seconds, setSeconds] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          NYT Mini Crossword
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
            />
          </Box>
          
          <Box sx={{ 
            flex: isMobile ? '1 1 auto' : '1 1 auto',
            minWidth: isMobile ? 'auto' : 300,
          }}>
            <ClueList 
              clues={samplePuzzle.clues}
              selectedClue={selectedClue}
              onClueSelect={setSelectedClue}
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default App;
