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