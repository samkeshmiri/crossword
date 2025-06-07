import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SuccessBar from '../SuccessBar';

describe('SuccessBar', () => {
  it('should be visible when open prop is true', () => {
    render(<SuccessBar open={true} />);
    
    const successAlert = screen.getByText('Congratulations! You\'ve completed the puzzle!');
    expect(successAlert).toBeVisible();
  });

  it('should not be visible when open prop is false', () => {
    render(<SuccessBar open={false} />);
    
    const successAlert = screen.queryByText('Congratulations! You\'ve completed the puzzle!');
    expect(successAlert).not.toBeInTheDocument();
  });

  it('should have success severity styling', () => {
    render(<SuccessBar open={true} />);
    
    const successAlert = screen.getByRole('alert');
    expect(successAlert).toHaveClass('MuiAlert-filledSuccess');
  });
}); 