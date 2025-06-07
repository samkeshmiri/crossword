import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Crossword from '../Crossword';
import type { MiniCrosswordPuzzle } from '../../../types';

// Sample puzzle data for testing
const testPuzzle: MiniCrosswordPuzzle = {
  date: "2025-01-20",
  puzzle_id: "test-mini-1",
  title: "Test Mini Crossword",
  size: {
    rows: 2,
    cols: 2
  },
  grid: [
    ["A", "B"],
    ["C", "D"]
  ],
  clues: {
    across: [
      { number: 1, clue: "First word", row: 0, col: 0, length: 2, answer: "AB" },
      { number: 2, clue: "Second word", row: 1, col: 0, length: 2, answer: "CD" }
    ],
    down: [
      { number: 1, clue: "First word", row: 0, col: 0, length: 2, answer: "AC" },
      { number: 2, clue: "Second word", row: 0, col: 1, length: 2, answer: "BD" }
    ]
  }
};

describe('Crossword', () => {
  describe('Direction Change Behavior', () => {
    it('should change direction when clicking on the same cell twice', () => {
      const setSelectedCell = jest.fn();
      const setDirection = jest.fn();
      
      render(
        <Crossword
          puzzle={testPuzzle}
          selectedCell={[0, 0]}
          setSelectedCell={setSelectedCell}
          direction="across"
          setDirection={setDirection}
        />
      );

      // Get the first cell input
      const inputs = screen.getAllByRole('textbox');
      
      // Click on the same cell that's already selected
      fireEvent.click(inputs[0]);
      
      // Should call setDirection to change from 'across' to 'down'
      expect(setDirection).toHaveBeenCalledWith('down');
    });

    it('should change direction from down to across when clicking the same cell', () => {
      const setSelectedCell = jest.fn();
      const setDirection = jest.fn();
      
      render(
        <Crossword
          puzzle={testPuzzle}
          selectedCell={[0, 0]}
          setSelectedCell={setSelectedCell}
          direction="down"
          setDirection={setDirection}
        />
      );

      // Get the first cell input
      const inputs = screen.getAllByRole('textbox');
      
      // Click on the same cell that's already selected
      fireEvent.click(inputs[0]);
      
      // Should call setDirection to change from 'down' to 'across'
      expect(setDirection).toHaveBeenCalledWith('across');
    });

    it('should not change direction when clicking on a different cell', () => {
      const setSelectedCell = jest.fn();
      const setDirection = jest.fn();
      
      render(
        <Crossword
          puzzle={testPuzzle}
          selectedCell={[0, 0]}
          setSelectedCell={setSelectedCell}
          direction="across"
          setDirection={setDirection}
        />
      );

      // Get the input elements
      const inputs = screen.getAllByRole('textbox');
      
      // Click on a different cell
      fireEvent.click(inputs[1]);
      
      // Should call setSelectedCell but not setDirection
      expect(setSelectedCell).toHaveBeenCalledWith([0, 1]);
      expect(setDirection).not.toHaveBeenCalled();
    });

    it('should set direction and select cell when no cell is currently selected', () => {
      const setSelectedCell = jest.fn();
      const setDirection = jest.fn();
      
      render(
        <Crossword
          puzzle={testPuzzle}
          selectedCell={null}
          setSelectedCell={setSelectedCell}
          direction="across"
          setDirection={setDirection}
        />
      );

      // Get the first cell input
      const inputs = screen.getAllByRole('textbox');
      
      // Click on a cell when none is selected
      fireEvent.click(inputs[0]);
      
      // Should call setSelectedCell but not change direction
      expect(setSelectedCell).toHaveBeenCalledWith([0, 0]);
      expect(setDirection).not.toHaveBeenCalled();
    });

    it('should not change direction when typing a letter and moving to next cell', () => {
      const setSelectedCell = jest.fn();
      const setDirection = jest.fn();
      
      render(
        <Crossword
          puzzle={testPuzzle}
          selectedCell={[0, 0]}
          setSelectedCell={setSelectedCell}
          direction="across"
          setDirection={setDirection}
        />
      );

      // Get the first cell input
      const inputs = screen.getAllByRole('textbox');
      
      // Clear the mock calls from initial render
      setSelectedCell.mockClear();
      setDirection.mockClear();
      
      // Type a letter in the first cell
      fireEvent.change(inputs[0], { target: { value: 'A' } });
      
      // Should move to next cell but not change direction
      expect(setSelectedCell).toHaveBeenCalledWith([0, 1]);
      expect(setDirection).not.toHaveBeenCalled();
    });
  });

  it('should show error banner when grid is complete but incorrect', () => {
    const setSelectedCell = jest.fn();
    const setDirection = jest.fn();
    
    render(
      <Crossword
        puzzle={testPuzzle}
        selectedCell={null}
        setSelectedCell={setSelectedCell}
        direction="across"
        setDirection={setDirection}
      />
    );

    // Fill in incorrect answers
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'X' } });
    fireEvent.change(inputs[1], { target: { value: 'Y' } });
    fireEvent.change(inputs[2], { target: { value: 'Z' } });
    fireEvent.change(inputs[3], { target: { value: 'W' } });

    // Check if error banner is visible
    const errorBanner = screen.getByText('One or more letters incorrect');
    expect(errorBanner).toBeVisible();
  });

  it('should not show error banner when grid is incomplete', () => {
    const setSelectedCell = jest.fn();
    const setDirection = jest.fn();
    
    render(
      <Crossword
        puzzle={testPuzzle}
        selectedCell={null}
        setSelectedCell={setSelectedCell}
        direction="across"
        setDirection={setDirection}
      />
    );

    // Fill in only one cell
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'A' } });

    // Check that error banner is not visible
    const errorBanner = screen.queryByText('One or more letters incorrect');
    expect(errorBanner).not.toBeInTheDocument();
  });

  it('should show success banner when grid is complete and correct', () => {
    const setSelectedCell = jest.fn();
    const setDirection = jest.fn();

    render(
      <Crossword
        puzzle={testPuzzle}
        selectedCell={null}
        setSelectedCell={setSelectedCell}
        direction="across"
        setDirection={setDirection}
      />
    );

    // Fill in correct answers
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'A' } });
    fireEvent.change(inputs[1], { target: { value: 'B' } });
    fireEvent.change(inputs[2], { target: { value: 'C' } });
    fireEvent.change(inputs[3], { target: { value: 'D' } });

    // Check if success banner is visible
    const successBanner = screen.getByText("Congratulations! You've completed the puzzle!");
    expect(successBanner).toBeVisible();
  });
}); 