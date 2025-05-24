import React, { useState } from 'react';
import { Container, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import Crossword from './components/Crossword';
import ClueList from './components/ClueList';

// Sample puzzle data
const samplePuzzle = {
  size: 5,
  clues: {
    across: [
      { number: 1, clue: "Opposite of 'down'", answer: "UP", direction: 'across' },
      { number: 4, clue: "A small amount", answer: "BIT", direction: 'across' },
      { number: 6, clue: "To move through water", answer: "SWIM", direction: 'across' },
    ],
    down: [
      { number: 1, clue: "To consume food", answer: "EAT", direction: 'down' },
      { number: 2, clue: "A small piece", answer: "PART", direction: 'down' },
      { number: 3, clue: "To make a mistake", answer: "ERR", direction: 'down' },
    ],
  },
};

function App() {
  const [selectedClue, setSelectedClue] = useState<typeof samplePuzzle.clues.across[0] | undefined>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          NYT Mini Crossword
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
