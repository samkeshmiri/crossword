import { Snackbar, Alert } from '@mui/material';

interface ErrorBarProps {
  open: boolean;
}

const ErrorBar: React.FC<ErrorBarProps> = ({ open }) => {
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
        severity="error" 
        variant="filled"
        sx={{ 
          width: '100%',
          '& .MuiAlert-message': {
            fontSize: '1rem',
            fontWeight: 'medium',
          }
        }}
      >
        One or more letters incorrect
      </Alert>
    </Snackbar>
  );
};

export default ErrorBar; 