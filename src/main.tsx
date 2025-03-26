import { Devvit, useState } from '@devvit/public-api';

// Devvit.configure({
//   redditAPI: true,
// });

Devvit.addMenuItem({
  label: 'Add my post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Submitting your post - upon completion you'll navigate there.");

    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'Colour Grid Game',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.navigateTo(post);
  },
});

const COLORS = ['red', 'blue', 'green', 'yellow'];
const GRID_SIZE = { rows: 5, cols: 5 };

Devvit.addCustomPostType({
  name: 'Colour Grid Game',
  height: 'regular',
  render: (_context) => {
    const [grid, setGrid] = useState(() => Array.from({ length: GRID_SIZE.rows }, () => Array(GRID_SIZE.cols).fill(null)));
    const [currentPlayer, setCurrentPlayer] = useState('Player 1');
    const [gameOver, setGameOver] = useState(false);
    const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);
    const [message, setMessage] = useState('');

    const getAdjacentCells = (row: number, col: number) => {
      return [
        [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]
      ].filter(([r, c]) => r >= 0 && r < GRID_SIZE.rows && c >= 0 && c < GRID_SIZE.cols);
    };

    const isValidMove = (row: number, col: number, color: string) => {
      return getAdjacentCells(row, col).every(([r, c]) => grid[r][c] !== color);
    };

    const makeMove = (row: number, col: number, color: string) => {
      if (grid[row][col]) {
        setMessage('Invalid move! This cell is already filled.');
        return;
      }
      if (!isValidMove(row, col, color)) {
        setMessage('Invalid move! Cannot use the same color as an adjacent cell.');
        return;
      }
      
      const newGrid = grid.map((rowArr, rIdx) =>
        rowArr.map((cell, cIdx) => (rIdx === row && cIdx === col ? color : cell))
      );
      setGrid(newGrid);
      setSelectedCell(null);
      setMessage('');
      
      const hasValidMove = newGrid.some((rowArr, rIdx) =>
        rowArr.some((cell, cIdx) =>
          !cell && COLORS.some(color => isValidMove(rIdx, cIdx, color))
        )
      );
      
      if (!hasValidMove) {
        setGameOver(true);
        setMessage(`${currentPlayer} wins!`);
      } else {
        setCurrentPlayer(currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1');
      }
    };

    return (
      <vstack height="100%" width="100%" gap="medium" alignment="center middle">
        <text size="large">Colour Grid Game</text>
        <text>{gameOver ? `${currentPlayer} wins!` : `${currentPlayer}'s turn`}</text>
        {message && <text size="medium" color="red">{message}</text>}
        <vstack gap="small">
          {grid.map((row, rowIndex) => (
            <hstack key={rowIndex} gap="small">
              {row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  appearance={cell ? 'primary' : 'secondary'}
                  width="40px"
                  height="40px"
                  onPress={() => !gameOver && setSelectedCell({ row: rowIndex, col: colIndex })}
                >
                  {cell || ''}
                </button>
              ))}
            </hstack>
          ))}
        </vstack>
        {selectedCell && (
          <hstack gap="small">
            {COLORS.map(color => (
              <button
                key={color}
                appearance="primary"
                width="40px"
                height="40px"
                onPress={() => {
                  if (selectedCell) {
                    makeMove(selectedCell.row, selectedCell.col, color);
                  }
                }}
              >
                {color}
              </button>
            ))}
          </hstack>
        )}
      </vstack>
    );
  },
});

export default Devvit;
