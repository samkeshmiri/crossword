import { useState, useEffect } from 'react';
import { Container, Box, Typography, useTheme, useMediaQuery, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
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
      { number: 2, clue: "To move through water", row: 0, col: 1, length: 5, answer: "WALLA" },
      { number: 3, clue: "Not off", row: 0, col: 2, length: 5, answer: "ABOUT" },
      { number: 4, clue: "A Spanish game", row: 0, col: 3, length: 5, answer: "MONTE" },
      { number: 5, clue: "Irish cupboard", row: 0, col: 4, length: 5, answer: "PRESS" },
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

  // Get all clues in proper navigation order (across first, then down)
  const getAllClues = (): Clue[] => {
    return [...samplePuzzle.clues.across, ...samplePuzzle.clues.down];
  };

  // Get current clue index in the combined list
  const getCurrentClueIndex = (): number => {
    const currentClue = getCurrentClue(samplePuzzle.clues, selectedCell, direction);
    
    console.log('🔍 getCurrentClueIndex - START:', {
      selectedCell,
      direction,
      currentClue: currentClue ? {
        number: currentClue.number,
        answer: currentClue.answer,
        row: currentClue.row,
        col: currentClue.col
      } : null
    });
    
    if (!currentClue) {
      console.log('❌ getCurrentClueIndex - No current clue found, returning -1');
      return -1;
    }
    
    const allClues = getAllClues();
    
    console.log('📋 All clues structure:', allClues.map((c, i) => ({
      index: i,
      number: c.number,
      answer: c.answer,
      row: c.row,
      col: c.col,
      section: i < samplePuzzle.clues.across.length ? 'across' : 'down'
    })));
    
    // If we're in across direction, look for the clue in the across section (indices 0-4)
    // If we're in down direction, look for the clue in the down section (indices 5-9)
    if (direction === 'across') {
      console.log('🔄 Searching in ACROSS clues (indices 0-4)');
      // Look for the current clue in the across clues (first part of allClues)
      for (let i = 0; i < samplePuzzle.clues.across.length; i++) {
        const clue = allClues[i];
        const matches = clue.number === currentClue.number && 
            clue.row === currentClue.row && 
            clue.col === currentClue.col;
        
        console.log(`  Checking across clue ${i}:`, {
          clue: { number: clue.number, answer: clue.answer, row: clue.row, col: clue.col },
          matches
        });
        
        if (matches) {
          console.log(`✅ Found matching across clue at index ${i}`);
          return i;
        }
      }
    } else {
      console.log('🔄 Searching in DOWN clues (indices 5-9)');
      // Look for the current clue in the down clues (second part of allClues)
      const downStartIndex = samplePuzzle.clues.across.length;
      for (let i = 0; i < samplePuzzle.clues.down.length; i++) {
        const clue = allClues[downStartIndex + i];
        const matches = clue.number === currentClue.number && 
            clue.row === currentClue.row && 
            clue.col === currentClue.col;
            
        console.log(`  Checking down clue ${downStartIndex + i}:`, {
          clue: { number: clue.number, answer: clue.answer, row: clue.row, col: clue.col },
          matches
        });
        
        if (matches) {
          console.log(`✅ Found matching down clue at index ${downStartIndex + i}`);
          return downStartIndex + i;
        }
      }
    }
    
    console.log('❌ getCurrentClueIndex - No matching clue found, returning -1');
    return -1;
  };

  // Navigate to a specific clue
  const navigateToClue = (clue: Clue) => {
    console.log('🎯 navigateToClue called with:', {
      clue: {
        number: clue.number,
        answer: clue.answer,
        row: clue.row,
        col: clue.col
      }
    });
    
    // Determine if this is an across or down clue by checking which array it comes from
    const allClues = getAllClues();
    const clueIndex = allClues.indexOf(clue);
    const isAcrossClue = clueIndex < samplePuzzle.clues.across.length;
    
    const newDirection = isAcrossClue ? 'across' : 'down';
    
    console.log('🎯 navigateToClue decisions:', {
      clueIndex,
      acrossCluesCount: samplePuzzle.clues.across.length,
      isAcrossClue,
      newDirection,
      willSetSelectedCell: [clue.row, clue.col],
      previousDirection: direction,
      previousSelectedCell: selectedCell
    });
    
    // Set the direction and selected cell to the start of the clue
    setDirection(newDirection);
    setSelectedCell([clue.row, clue.col]);
    
    console.log('🎯 navigateToClue state changes applied');
  };

  // Navigate to previous clue
  const goToPreviousClue = () => {
    console.log('\n🔙 PREVIOUS BUTTON PRESSED');
    const allClues = getAllClues();
    const currentIndex = getCurrentClueIndex();
    
    console.log('Previous navigation state:', {
      currentIndex,
      totalClues: allClues.length,
      selectedCell,
      direction
    });
    
    if (currentIndex <= 0) {
      console.log('➡️ Going to LAST clue (wrap around)');
      navigateToClue(allClues[allClues.length - 1]);
    } else {
      console.log(`➡️ Going to clue at index ${currentIndex - 1}`);
      navigateToClue(allClues[currentIndex - 1]);
    }
    console.log('🔙 PREVIOUS BUTTON PROCESSING COMPLETE\n');
  };

  // Navigate to next clue
  const goToNextClue = () => {
    console.log('\n🔜 NEXT BUTTON PRESSED');
    const allClues = getAllClues();
    const currentIndex = getCurrentClueIndex();
    
    console.log('Next navigation state:', {
      currentIndex,
      totalClues: allClues.length,
      selectedCell,
      direction,
      isAtEnd: currentIndex >= allClues.length - 1,
      isInvalidIndex: currentIndex === -1
    });
    
    if (currentIndex >= allClues.length - 1 || currentIndex === -1) {
      console.log('➡️ Going to FIRST clue (wrap around or invalid current)');
      navigateToClue(allClues[0]);
    } else {
      console.log(`➡️ Going to clue at index ${currentIndex + 1}:`, {
        targetClue: {
          number: allClues[currentIndex + 1].number,
          answer: allClues[currentIndex + 1].answer,
          row: allClues[currentIndex + 1].row,
          col: allClues[currentIndex + 1].col
        }
      });
      navigateToClue(allClues[currentIndex + 1]);
    }
    console.log('🔜 NEXT BUTTON PROCESSING COMPLETE\n');
  };

  // Initialize with first clue if no cell is selected
  useEffect(() => {
    if (!selectedCell) {
      const allClues = getAllClues();
      if (allClues.length > 0) {
        navigateToClue(allClues[0]);
      }
    }
  }, []);

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
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                minHeight: 40
              }}>
                <IconButton 
                  onClick={goToPreviousClue}
                  size="small"
                  sx={{ flexShrink: 0 }}
                >
                  <ArrowBackIos fontSize="small" />
                </IconButton>
                
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography variant="body1">
                    {getCurrentClue(samplePuzzle.clues, selectedCell, direction)?.clue || 'Select a cell'}
                  </Typography>
                </Box>
                
                <IconButton 
                  onClick={goToNextClue}
                  size="small"
                  sx={{ flexShrink: 0 }}
                >
                  <ArrowForwardIos fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default App;
