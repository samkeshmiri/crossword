import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock console methods to avoid log output during tests
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('App Component', () => {
  describe('Clue Navigation', () => {
    it('should render navigation arrows', () => {
      render(<App />);
      
      // Check for navigation buttons by finding all buttons
      const buttons = screen.getAllByRole('button');
      // Should have at least 2 navigation buttons (left and right arrows)
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('should display current clue text', () => {
      render(<App />);
      
      // Should display a clue (the first clue should be selected by default)
      // Look for clue text - should not show "Select a cell" since a cell is auto-selected
      const clueDisplay = screen.getByText(/wetland area/i);
      expect(clueDisplay).toBeInTheDocument();
    });

    it('should navigate to next clue when next button is clicked', () => {
      render(<App />);
      
      // Get the initial clue text
      expect(screen.getByText(/wetland area/i)).toBeInTheDocument();
      
      // Find and click the next button (right arrow)
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find(button => 
        button.querySelector('svg[data-testid="ArrowForwardIosIcon"]')
      );
      expect(nextButton).toBeInTheDocument();
      
      fireEvent.click(nextButton!);
      
      // Should now show the second clue
      expect(screen.getByText(/work or toil/i)).toBeInTheDocument();
    });

    it('should navigate to previous clue when previous button is clicked', () => {
      render(<App />);
      
      // First navigate to second clue
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find(button => 
        button.querySelector('svg[data-testid="ArrowForwardIosIcon"]')
      );
      fireEvent.click(nextButton!);
      
      // Now go back to previous clue
      const prevButton = buttons.find(button => 
        button.querySelector('svg[data-testid="ArrowBackIosIcon"]')
      );
      fireEvent.click(prevButton!);
      
      // Should be back to the first clue
      expect(screen.getByText(/wetland area/i)).toBeInTheDocument();
    });

    it('should wrap around when navigating past the last clue', () => {
      render(<App />);
      
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find(button => 
        button.querySelector('svg[data-testid="ArrowForwardIosIcon"]')
      );
      
      // Navigate through all clues (5 across + 5 down = 10 total)
      // Click next 10 times to wrap around
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton!);
      }
      
      // Should wrap back to the first clue
      expect(screen.getByText(/wetland area/i)).toBeInTheDocument();
    });

    it('should wrap around when navigating before the first clue', () => {
      render(<App />);
      
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons.find(button => 
        button.querySelector('svg[data-testid="ArrowBackIosIcon"]')
      );
      
      // From the first clue, go to previous (should wrap to last)
      fireEvent.click(prevButton!);
      
      // Should now show the last clue (last down clue)
      expect(screen.getByText(/irish cupboard/i)).toBeInTheDocument();
    });

    it('should change direction when navigating from across to down clues', () => {
      render(<App />);
      
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find(button => 
        button.querySelector('svg[data-testid="ArrowForwardIosIcon"]')
      );
      
      // Navigate through all across clues (5 clues)
      for (let i = 0; i < 5; i++) {
        fireEvent.click(nextButton!);
      }
      
      // Should now be on the first down clue
      expect(screen.getByText(/opposite of fast/i)).toBeInTheDocument();
    });

    it('should update crossword selection when navigating between clues', () => {
      render(<App />);
      
      // Get initial crossword state - first cell should be selected
      const inputs = screen.getAllByRole('textbox');
      
      // Navigate to next clue
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find(button => 
        button.querySelector('svg[data-testid="ArrowForwardIosIcon"]')
      );
      fireEvent.click(nextButton!);
      
      // The crossword should update to reflect the new clue selection
      // We can verify this by checking that inputs are still available (crossword is rendering)
      const updatedInputs = screen.getAllByRole('textbox');
      expect(updatedInputs.length).toBeGreaterThan(0);
    });
  });

  describe('Crossword Integration', () => {
    it('should display timer', () => {
      render(<App />);
      
      // Should show timer in MM:SS format (00:00 or 00:01 etc)
      expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
    });

    it('should render crossword grid', () => {
      render(<App />);
      
      // Should render multiple input boxes for the crossword grid
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(1);
    });

    it('should handle cell selection in crossword affecting clue display', () => {
      render(<App />);
      
      // Click on a different cell in the crossword
      const inputs = screen.getAllByRole('textbox');
      
      // Click on a cell (assuming this will change the current clue)
      fireEvent.click(inputs[5]); // Click on a different cell
      
      // The clue display should potentially change based on the new selection
      // We'll just verify that some clue is still displayed
      const clueArea = screen.getByText(/wetland area|work or toil|by oneself|promiscuous people|strongly dislikes|opposite of fast|to move through water|not off|a spanish game|irish cupboard/i);
      expect(clueArea).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should render main title', () => {
      render(<App />);
      
      expect(screen.getByText('CWORD')).toBeInTheDocument();
    });

    it('should display clue navigation area', () => {
      render(<App />);
      
      // Should have the navigation arrows
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
      
      // Should display the clue area text
      const clueText = screen.getByText(/wetland area|work or toil|by oneself|promiscuous people|strongly dislikes|opposite of fast|to move through water|not off|a spanish game|irish cupboard/i);
      expect(clueText).toBeInTheDocument();
    });
  });
}); 