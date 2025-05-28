import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBar from '../ErrorBar';

describe('ErrorBar', () => {
  it('should be visible when open prop is true', () => {
    render(<ErrorBar open={true} />);
    
    const errorAlert = screen.getByText('One or more letters incorrect');
    expect(errorAlert).toBeVisible();
  });

  it('should not be visible when open prop is false', () => {
    render(<ErrorBar open={false} />);
    
    const errorAlert = screen.queryByText('One or more letters incorrect');
    expect(errorAlert).not.toBeInTheDocument();
  });
}); 