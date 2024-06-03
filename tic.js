document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("board");
  const resultsText = document.getElementById("resultsText");
  const resultsHistory = document.getElementById("resultsHistory");
  const resetBtn = document.getElementById("reset-btn");
  const totalWinsAndTies = document.createElement("div");
  const historyList = document.createElement("div");

  let currentPlayer = "X";
  let gameBoard = Array(9).fill("");
  let gameResult = "";
  let gameHistory = JSON.parse(localStorage.getItem("gameHistory")) || {
    player: 0,
    computer: 0,
    tie: 0,
    history: [],
  };

  const init = () => {
    createBoard();
    updateResults();

    board.addEventListener("click", handleCellClick);
    resetBtn.addEventListener("click", startNewGame);

    resultsHistory.appendChild(totalWinsAndTies);
    resultsHistory.appendChild(historyList);

    displayHistory();
  };

  const createBoard = () => {
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.setAttribute("data-index", i);
      board.appendChild(cell);
    }
  };

  const handleCellClick = (event) => {
    const clickedIndex = event.target.dataset.index;

    if (currentPlayer !== "X" || gameBoard[clickedIndex] !== "" || gameResult) {
      return;
    }

    gameBoard[clickedIndex] = currentPlayer;
    event.target.textContent = currentPlayer;

    if (checkWinner()) {
      gameResult = currentPlayer === "X" ? "Player wins!" : "Computer wins!";
      endGame();
    } else if (!gameBoard.includes("")) {
      gameResult = "It's a tie!";
      endGame();
    } else {
      currentPlayer = "O";
      setTimeout(computerMove, 1000);
    }
  };

  const computerMove = () => {
    const emptyCells = gameBoard.reduce(
      (acc, cell, index) => (cell === "" ? acc.concat(index) : acc),
      []
    );

    const winningMove = findWinningMove("O");
    const blockingMove = findWinningMove("X");

    if (winningMove !== -1) {
      makeMove(winningMove);
    } else if (blockingMove !== -1) {
      makeMove(blockingMove);
    } else if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      makeMove(emptyCells[randomIndex]);
    }
  };

  const findWinningMove = (player) => {
    for (let i = 0; i < gameBoard.length; i++) {
      if (gameBoard[i] === "") {
        const tempBoard = [...gameBoard];
        tempBoard[i] = player;
        if (checkWinner(tempBoard)) {
          return i;
        }
      }
    }
    return -1;
  };

  const makeMove = (index) => {
    gameBoard[index] = "O";
    document.querySelector(`[data-index="${index}"]`).textContent = "O";

    if (checkWinner()) {
      gameResult = currentPlayer === "X" ? "Player wins!" : "Computer wins!";
      endGame();
    } else if (!gameBoard.includes("")) {
      gameResult = "It's a tie!";
      endGame();
    } else {
      currentPlayer = "X"; 
    }
  };

  const endGame = () => {
    const currentDate = new Date();
    const resultEntry = {
      date: currentDate.toLocaleString(),
      winner: determineWinner(),
    };

    if (resultEntry.winner.includes("Player")) {
      gameHistory.player += 1;
    } else if (resultEntry.winner.includes("Computer")) {
      gameHistory.computer += 1;
    } else {
      gameHistory.tie += 1;
    }

    gameHistory.history.unshift(resultEntry);

    if (gameHistory.history.length > 10) {
      gameHistory.history.pop();
    }

    localStorage.setItem("gameHistory", JSON.stringify(gameHistory));

    setTimeout(() => {
      updateResults();
      displayHistory();
      resetGame();
    }, 500);
  };

  const determineWinner = () => {
    const currentPlayerSymbol = currentPlayer === "X" ? "Player" : "Computer";

    if (checkWinner()) {
      return `${currentPlayerSymbol} wins!`;
    } else if (!gameBoard.includes("")) {
      return "It's a tie!";
    } else {
      return "";
    }
  };

  const checkWinner = (currentBoard = gameBoard) => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return true;
      }
    }
    return false;
  };

  const updateResults = () => {
    const resultText = document.createElement("div");
    resultText.textContent = gameResult;
    resultsText.innerHTML = "";
    resultsText.appendChild(resultText);
  };

  const displayHistory = () => {
    totalWinsAndTies.textContent = `Player: ${gameHistory.player} | Computer: ${gameHistory.computer} | Tie: ${gameHistory.tie}`;

    historyList.innerHTML = "<h3>Game History</h3>";

    for (const entry of gameHistory.history) {
      const entryText = document.createElement("div");
      entryText.textContent = `${entry.date} - ${entry.winner}`;
      historyList.appendChild(entryText);
    }
  };

  const resetGame = () => {
    gameBoard = Array(9).fill("");
    currentPlayer = "X";
    gameResult = "";
    board.querySelectorAll(".cell").forEach((cell) => (cell.textContent = ""));
    updateResults();
  };

  const startNewGame = () => {
    gameHistory = { player: 0, computer: 0, tie: 0, history: [] };
    localStorage.setItem("gameHistory", JSON.stringify(gameHistory));

    resetGame();
    displayHistory();
    updateResults();

    resultsText.innerHTML = "";
  };

  init();
});
