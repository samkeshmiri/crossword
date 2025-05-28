import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

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

export default CellInput; 