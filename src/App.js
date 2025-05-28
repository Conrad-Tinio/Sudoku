// CMSC 121 LB1B EXAM 1
// Code by: Tinio, Louis Conrad Andrei S.

import React, { useState, useEffect } from 'react';
import './SudokuStyles.css';

const SudokuGame = () => {
  const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [initialBoard, setInitialBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [solvedBoard, setSolvedBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [gameTimer, setGameTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [darkModeOn, setDarkMode] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [hintUsed, setHintUsed] = useState(false);
  const [gameStatus, setGameStatus] = useState(null);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const createSolvedBoard = () => {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    
    const isValidSolution = (board, row, column, number) => {
      return !board[row].includes(number) && !board.map(r => r[column]).includes(number) && 
             !Array(3).fill().flatMap((_, i) => Array(3).fill().map((_, j) => 
                 board[Math.floor(row/3)*3 + i][Math.floor(column/3)*3 + j])
             ).includes(number);
    };
    
    const solveBoard = (board) => {
      for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
          if (board[row][column] === 0) {
            const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            for (let num of nums) {
              if (isValidSolution(board, row, column, num)) {
                board[row][column] = num;
                if (solveBoard(board)) return true;
                board[row][column] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };
    
    solveBoard(board);
    return board;
  };

  const createSudokuGame = () => {
    setGameStatus(null);
    setIsGameComplete(false);
    setGameTimer(0);
    setIsTimerRunning(true);
    setHintsRemaining(3);
    setHintUsed(false);
    
    const solvedBoard = createSolvedBoard();
    const sudokuPuzzle = JSON.parse(JSON.stringify(solvedBoard));
    const cellsToRemove = Math.floor(Math.random() * 15) + 40;
    let removed = 0;
    
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      if (sudokuPuzzle[row][col] !== 0) {
        sudokuPuzzle[row][col] = 0;
        removed++;
      }
    }
    
    setInitialBoard(JSON.parse(JSON.stringify(sudokuPuzzle)));
    setBoard(JSON.parse(JSON.stringify(sudokuPuzzle)));
    setSolvedBoard(solvedBoard);
  };

  const handleSelectedCell = (row, column) => {
    if (initialBoard[row][column] === 0 && !isGameComplete) {
      setSelectedCell({ row, col: column });
      setHintUsed(false);
    }
  };

  const handleNumberInput = (number) => {
    if (!selectedCell || isGameComplete || board[selectedCell.row][selectedCell.col] === number) return;
    const { row, col } = selectedCell;
    if (initialBoard[row][col] === 0) {
      const newBoard = [...board];
      newBoard[row][col] = number;
      setBoard(newBoard);
    }
  };

  const isBoardComplete = (board) => {
    return !board.some(row => row.includes(0));
  };

  const validateSolution = () => {
    if (!isBoardComplete(board)) {
      setGameStatus('incomplete');
      setTimeout(() => {
        setGameStatus(null);
      }, 2000);
      return;
    }

    const isRowValid = row => {
      const values = row.filter(cell => cell !== 0);
      return new Set(values).size === values.length;
    };
    
    const isColumnValid = col => {
      const values = board.map(row => row[col]).filter(cell => cell !== 0);
      return new Set(values).size === values.length;
    };
    
    for (let i = 0; i < 9; i++) {
      if (!isRowValid(board[i]) || !isColumnValid(i)) {
        setGameStatus('lose');
        setIsGameComplete(true);
        setIsTimerRunning(false);
        return;
      }
    }
    
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const values = [];
        for (let row = 0; row < 3; row++) {
          for (let column = 0; column < 3; column++) {
            const value = board[boxRow * 3 + row][boxCol * 3 + column];
            if (value !== 0) values.push(value);
          }
        }
        if (new Set(values).size !== values.length) {
          setGameStatus('lose');
          setIsGameComplete(true);
          setIsTimerRunning(false);
          return;
        }
      }
    }
    setGameStatus('win');
    setIsGameComplete(true);
    setIsTimerRunning(false);
  };

  const clearSelectedCell = () => {
    if (selectedCell && initialBoard[selectedCell.row][selectedCell.col] === 0) {
      const newBoard = [...board];
      newBoard[selectedCell.row][selectedCell.col] = 0;
      setBoard(newBoard);
    }
  };
  
  const shouldHighlightCell = (row, col) => {
    if (!selectedCell) return false;
    const { row: selectedRow, col: selectedCol } = selectedCell;
    return row === selectedRow || 
           col === selectedCol || 
           (Math.floor(row / 3) === Math.floor(selectedRow / 3) && 
            Math.floor(col / 3) === Math.floor(selectedCol / 3));
  };

  const getHint = () => {
    if (hintsRemaining <= 0 || isGameComplete) {
      return;
    }
    const emptyCells = [];
    for (let row = 0; row < 9; row++) {
      for (let column = 0; column < 9; column++) {
        if (board[row][column] === 0) {
          emptyCells.push({ row, col: column });
        }
      }
    }
    if (emptyCells.length === 0) {
      return; 
    }
    
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { row, col: column } = emptyCells[randomIndex];
    const correctValue = solvedBoard[row][column];
    const newBoard = [...board];
    newBoard[row][column] = correctValue;
    setBoard(newBoard);
    setHintsRemaining(hintsRemaining - 1);
    setHintUsed(true);
    setSelectedCell({ row, col: column });
  };

  const formatTime = (seconds) => {
    return [
      Math.floor(seconds / 3600),
      Math.floor((seconds % 3600) / 60),
      seconds % 60
    ].map(v => v.toString().padStart(2, '0')).join(':');
  };

  const changeToDarkMode = () => {
    setDarkMode(!darkModeOn);
    document.body.classList.toggle('dark', !darkModeOn);
  };

  useEffect(() => {
    let interval = null;
    
    if (isTimerRunning) {
      interval = setInterval(() => setGameTimer(prev => prev + 1), 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    createSudokuGame();
    document.body.classList.toggle('dark', darkModeOn);
    
    return () => document.body.classList.remove('dark');
  }, []);

  useEffect(() => {
    let timeout = null;
    if (hintUsed) {
      timeout = setTimeout(() => {
        setHintUsed(false);
      }, 2000);
    }
    
    return () => clearTimeout(timeout);
  }, [hintUsed]);

  const appearance = darkModeOn ? 'dark' : 'light';

  return (
    <div className={`sudoku-container ${appearance}`}>
      <h1 className={`game-title ${appearance}`}>Sudoku</h1>

      <div className="timer-section">
        <div className="timer-display">
          {formatTime(gameTimer)}
          <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`timer-control ${appearance}`}>
            {isTimerRunning ? '⏸' : '▶'}
          </button>
        </div>
    
        <button onClick={changeToDarkMode} className={`theme-toggle ${appearance}`}>
          {darkModeOn ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
      
      {gameStatus && (
        <div className={`status-message ${gameStatus} ${appearance}`}>
          {gameStatus === 'win' ? 'Congratulations! You Win!' : 
          gameStatus === 'lose' ? 'Oh no! You Lost!' : 'Please complete the puzzle first'}
        </div>
      )}
      
      {hintUsed && (
        <div className={`status-message hint ${appearance}`}>Hint used! Correct value filled.</div>
      )}
      
      <div className={`sudoku-grid ${appearance}`}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => {
              const isInitial = initialBoard[rowIndex][colIndex] !== 0;
              const isSelected = selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex;
              const highlighted = shouldHighlightCell(rowIndex, colIndex);
              const borderRight = (colIndex + 1) % 3 === 0 && colIndex < 8;
              const borderBottom = (rowIndex + 1) % 3 === 0 && rowIndex < 8;
              const isHint = !isInitial && 
                            board[rowIndex][colIndex] !== 0 && 
                            board[rowIndex][colIndex] === solvedBoard[rowIndex][colIndex];
              
              return (
                <div 
                  key={`${rowIndex}-${colIndex}`} 
                  className={`
                    grid-cell ${appearance}
                    ${isInitial ? 'initial' : ''}
                    ${isSelected ? 'selected' : ''}
                    ${!isSelected && highlighted ? 'highlighted' : ''}
                    ${borderRight ? 'border-right' : ''}
                    ${borderBottom ? 'border-bottom' : ''}
                    ${!isInitial && !isGameComplete ? 'editable' : ''}
                    ${isHint && !isInitial ? 'hint-cell' : ''}
                  `}
                  onClick={() => handleSelectedCell(rowIndex, colIndex)}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="number-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            className={`number-button ${appearance}`}
            onClick={() => handleNumberInput(num)}
          >
            {num}
          </button>
        ))}
        <button className={`clear-button ${appearance}`} onClick={clearSelectedCell}>X</button>
      </div>
      
      <div className="button-container">
        <button onClick={createSudokuGame} className={`new-game-button ${appearance}`}>New Game</button>
        
        <button
          className={`hint-button ${appearance} ${hintsRemaining <= 0 ? 'disabled' : ''}`}
          onClick={getHint}
          disabled={hintsRemaining <= 0 || isGameComplete}
        >
          💡Hint ({hintsRemaining})
        </button>

        <button className={`check-solution-button ${appearance}`} onClick={validateSolution}>
          ✓ Check 
        </button>
      </div>
    </div>
  );
};

export default SudokuGame;