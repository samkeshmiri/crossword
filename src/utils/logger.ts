type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  
  private formatLog(level: LogLevel, category: string, message: string, data?: any): LogEntry {
    return {
      level,
      category,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  private log(level: LogLevel, category: string, message: string, data?: any) {
    if (!this.isDev) return;

    const logEntry = this.formatLog(level, category, message, data);
    const prefix = `[${logEntry.timestamp}] [${level.toUpperCase()}] [${category}]`;
    
    const logMethod = level === 'error' ? console.error : 
                     level === 'warn' ? console.warn : 
                     level === 'info' ? console.info : console.log;

    if (data !== undefined) {
      logMethod(`${prefix} ${message}`, data);
    } else {
      logMethod(`${prefix} ${message}`);
    }
  }

  debug(category: string, message: string, data?: any) {
    this.log('debug', category, message, data);
  }

  info(category: string, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.log('error', category, message, data);
  }

  // Convenience methods for common crossword logging
  puzzleInit(puzzle: any) {
    this.info('PUZZLE', 'Crossword initialized', {
      size: puzzle.size,
      clueCount: {
        across: puzzle.clues.across?.length || 0,
        down: puzzle.clues.down?.length || 0
      }
    });
  }

  cellClick(row: number, col: number, currentDirection: string, isSameCell: boolean) {
    this.debug('INTERACTION', `Cell clicked at (${row}, ${col})`, {
      currentDirection,
      isSameCell,
      action: isSameCell ? 'direction_toggle' : 'cell_selection'
    });
  }

  keyPress(key: string, selectedCell: [number, number] | null, direction: string) {
    this.debug('INTERACTION', `Key pressed: ${key}`, {
      selectedCell,
      direction,
      isNavigation: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace'].includes(key),
      isLetter: /^[a-zA-Z]$/.test(key)
    });
  }

  cellChange(row: number, col: number, oldValue: string, newValue: string) {
    this.debug('GRID', `Cell value changed at (${row}, ${col})`, {
      oldValue,
      newValue,
      action: newValue ? 'letter_entered' : 'letter_cleared'
    });
  }

  gridComplete(isComplete: boolean, isValid?: boolean) {
    if (isComplete) {
      this.info('PUZZLE', `Grid completed - ${isValid ? 'VALID' : 'INVALID'}`, { isValid });
    } else {
      this.debug('PUZZLE', 'Grid no longer complete');
    }
  }

  validationToggle(enabled: boolean) {
    this.info('VALIDATION', `Answer checking ${enabled ? 'enabled' : 'disabled'}`);
  }

  directionChange(oldDirection: string, newDirection: string, trigger: string) {
    this.debug('INTERACTION', `Direction changed: ${oldDirection} → ${newDirection}`, {
      trigger
    });
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger; 