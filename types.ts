export interface Clue {
  number: number;
  clue: string;
  row: number;
  col: number;
  length: number;
  answer: string;
}

export interface Size {
  rows: number;
  cols: number;
}

export interface Clues {
  across: Clue[];
  down: Clue[];
}

export interface MiniCrosswordPuzzle {
  date: string;
  puzzle_id: string;
  title: string;
  size: Size;
  grid: string[][];
  clues: Clues;
  black_squares?: [number, number][];
} 