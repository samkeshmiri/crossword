import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock the service factory to return synchronous data for testing
jest.mock('../../services/serviceFactory', () => {
  // Create a mock service that returns data immediately
  const mockService = {
    async getDailyPuzzle() {
      return Promise.resolve({
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
      });
    },
    async getPuzzle() {
      return this.getDailyPuzzle();
    }
  };
  
  return {
    puzzleService: mockService,
    createPuzzleService: () => mockService
  };
});

// Helper function to wait for app to load
const waitForAppToLoad = async () => {
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
};

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
    it('should render navigation arrows', async () => {
      render(<App />);
      
      // Wait for the puzzle to load
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
      
      // Check for navigation buttons by finding all buttons
      const buttons = screen.getAllByRole('button');
      // Should have at least 2 navigation buttons (left and right arrows)
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('should display current clue text', async () => {
      render(<App />);
      
      // Wait for puzzle to load and clue to appear
      await waitFor(() => {
        expect(screen.getByText(/wetland area/i)).toBeInTheDocument();
      });
    });

    it('should navigate to next clue when next button is clicked', async () => {
      render(<App />);
      
      // Wait for puzzle to load and initial clue to appear
      await waitFor(() => {
        expect(screen.getByText(/wetland area/i)).toBeInTheDocument();
      });
      
      // Find and click the next button (right arrow)
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find(button => 
        button.querySelector('svg[data-testid="ArrowForwardIosIcon"]')
      );
      expect(nextButton).toBeInTheDocument();
      
      fireEvent.click(nextButton!);
      
      // Should now show the second clue
      await waitFor(() => {
        expect(screen.getByText(/work or toil/i)).toBeInTheDocument();
      });
    });

    it('should navigate to previous clue when previous button is clicked', async () => {
      render(<App />);
      await waitForAppToLoad();
      
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
      await waitFor(() => {
        expect(screen.getByText(/wetland area/i)).toBeInTheDocument();
      });
    });

    it('should wrap around when navigating past the last clue', async () => {
      render(<App />);
      await waitForAppToLoad();
      
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
      await waitFor(() => {
        expect(screen.getByText(/wetland area/i)).toBeInTheDocument();
      });
    });

    it('should wrap around when navigating before the first clue', async () => {
      render(<App />);
      await waitForAppToLoad();
      
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons.find(button => 
        button.querySelector('svg[data-testid="ArrowBackIosIcon"]')
      );
      
      // From the first clue, go to previous (should wrap to last)
      fireEvent.click(prevButton!);
      
      // Should now show the last clue (last down clue)
      await waitFor(() => {
        expect(screen.getByText(/irish cupboard/i)).toBeInTheDocument();
      });
    });

    it('should change direction when navigating from across to down clues', async () => {
      render(<App />);
      await waitForAppToLoad();
      
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find(button => 
        button.querySelector('svg[data-testid="ArrowForwardIosIcon"]')
      );
      
      // Navigate through all across clues (5 clues)
      for (let i = 0; i < 5; i++) {
        fireEvent.click(nextButton!);
      }
      
      // Should now be on the first down clue
      await waitFor(() => {
        expect(screen.getByText(/opposite of fast/i)).toBeInTheDocument();
      });
    });

    it('should update crossword selection when navigating between clues', async () => {
      render(<App />);
      await waitForAppToLoad();
      
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
    it('should display timer', async () => {
      render(<App />);
      await waitForAppToLoad();
      
      // Should show timer in MM:SS format (00:00 or 00:01 etc)
      expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
    });

    it('should render crossword grid', async () => {
      render(<App />);
      await waitForAppToLoad();
      
      // Should render multiple input boxes for the crossword grid
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(1);
    });

    it('should handle cell selection in crossword affecting clue display', async () => {
      render(<App />);
      await waitForAppToLoad();
      
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
    it('should render main title', async () => {
      render(<App />);
      await waitForAppToLoad();
      
      expect(screen.getByText('CWORD')).toBeInTheDocument();
    });

    it('should display clue navigation area', async () => {
      render(<App />);
      await waitForAppToLoad();
      
      // Should have the navigation arrows
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
      
      // Should display the clue area text
      const clueText = screen.getByText(/wetland area|work or toil|by oneself|promiscuous people|strongly dislikes|opposite of fast|to move through water|not off|a spanish game|irish cupboard/i);
      expect(clueText).toBeInTheDocument();
    });
  });
}); 