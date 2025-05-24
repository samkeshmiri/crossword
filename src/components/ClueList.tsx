import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

interface Clue {
  number: number;
  clue: string;
  answer: string;
  direction: 'across' | 'down';
}

interface ClueListProps {
  clues: {
    across: Clue[];
    down: Clue[];
  };
  selectedClue?: Clue;
  onClueSelect: (clue: Clue) => void;
}

const ClueList: React.FC<ClueListProps> = ({ clues, selectedClue, onClueSelect }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Across
        </Typography>
        <List dense>
          {clues.across.map((clue) => (
            <ListItem
              key={`across-${clue.number}`}
              button
              selected={selectedClue?.number === clue.number && selectedClue?.direction === 'across'}
              onClick={() => onClueSelect(clue)}
            >
              <ListItemText
                primary={`${clue.number}. ${clue.clue}`}
                primaryTypographyProps={{
                  variant: 'body2',
                  color: selectedClue?.number === clue.number && selectedClue?.direction === 'across'
                    ? 'primary'
                    : 'textPrimary',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Down
        </Typography>
        <List dense>
          {clues.down.map((clue) => (
            <ListItem
              key={`down-${clue.number}`}
              button
              selected={selectedClue?.number === clue.number && selectedClue?.direction === 'down'}
              onClick={() => onClueSelect(clue)}
            >
              <ListItemText
                primary={`${clue.number}. ${clue.clue}`}
                primaryTypographyProps={{
                  variant: 'body2',
                  color: selectedClue?.number === clue.number && selectedClue?.direction === 'down'
                    ? 'primary'
                    : 'textPrimary',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default ClueList; 