import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import CellInput from './CellInput';

interface Cell {
  value: string;
  number?: number;
  isBlack: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isIncorrect?: boolean;
}

interface CrosswordCellProps {
  cell: Cell;
  rowIndex: number;
  colIndex: number;
  onCellClick: (row: number, col: number) => void;
  inputRef: (el: HTMLInputElement | null) => void;
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const CrosswordCell: React.FC<CrosswordCellProps> = ({
  cell,
  rowIndex,
  colIndex,
  onCellClick,
  inputRef,
  onFocus,
  onChange,
  onKeyDown,
}) => {
  return (
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
      onClick={() => onCellClick(rowIndex, colIndex)}
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
          {/* Red diagonal line for incorrect answers */}
          {cell.isIncorrect && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, transparent 48%, red 48%, red 52%, transparent 52%)',
                  pointerEvents: 'none',
                  zIndex: 1,
                },
              }}
            />
          )}
          
          {cell.number && (
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: 2,
                left: 2,
                fontSize: '0.6rem',
                zIndex: 2,
              }}
            >
              {cell.number}
            </Typography>
          )}
          <CellInput
            value={cell.value}
            inputRef={inputRef}
            onFocus={onFocus}
            onChange={onChange}
            onKeyDown={onKeyDown}
            inputProps={{
              maxLength: 1,
              style: { textAlign: 'center', zIndex: 2, position: 'relative' },
            }}
            variant="outlined"
            size="small"
            fullWidth
            autoComplete="off"
          />
        </Box>
      )}
    </Paper>
  );
};

export default CrosswordCell; 