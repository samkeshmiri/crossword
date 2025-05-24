import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper, ListItemButton } from '@mui/material';
import type { Clue } from '../types';

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
            <ListItem key={`across-${clue.number}`} disablePadding>
              <ListItemButton
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
              </ListItemButton>
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
            <ListItem key={`down-${clue.number}`} disablePadding>
              <ListItemButton
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
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default ClueList; 