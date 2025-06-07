import { Snackbar, Alert } from '@mui/material';

interface SuccessBarProps {
  open: boolean;
}

const SuccessBar: React.FC<SuccessBarProps> = ({ open }) => {
  return (
    <Snackbar 
      open={open} 
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ 
        top: '20px !important',
        '& .MuiAlert-root': {
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        }
      }}
    >
      <Alert 
        severity="success" 
        variant="filled"
        sx={{ 
          width: '100%',
          '& .MuiAlert-message': {
            fontSize: '1rem',
            fontWeight: 'medium',
          }
        }}
      >
        Congratulations! You've completed the puzzle!
      </Alert>
    </Snackbar>
  );
};

export default SuccessBar; 