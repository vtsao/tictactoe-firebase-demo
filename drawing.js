/**
 * Utility functions for drawing tic-tac-toe game elements. Numbers are
 * hardcoded for a canvas size of 480x480 for the sake of this demo. The X's and
 * O's are drawn to be a size of 110x110 in a cell on the tic-tac-toe grid (each
 * grid size is 160x160 due to the canvas size).
 *
 * TODO(vtsao): Update this code to dynamically draw the game elements for a
 * dynamic width.
 */

/**
 * Takes the data model index of a cell and unflattens it to a 2-D view
 * coordinate.
 */
function unflattenCellIndex(cellIndex, width) {
  return {x: cellIndex % width, y: Math.floor(cellIndex / width)};
}

/**
 * Calculates the offset of the X or O for the specified tic-tac-toe cell.
 */
function gridToOffset(coordinates) {
  return {xOffset: coordinates.x * 160, yOffset: coordinates.y * 160};
}

/**
 * Draws the tic-tac-toe board on the specified canvas context.
 */
function drawBoard(context) {
  context.beginPath();

  // Draw the x-axis lines.
  context.moveTo(0, 160);
  context.lineTo(480, 160);
  context.moveTo(0, 320);
  context.lineTo(480, 320);

  // Draw the y-axis lines.
  context.moveTo(160, 0);
  context.lineTo(160, 480);
  context.moveTo(320, 0);
  context.lineTo(320, 480);

  // Fill the lines.
  context.strokeStyle = '#000';
  context.lineWidth = '1';
  context.lineCap = 'round';
  context.stroke();
}

/**
 * Draws an 'X' on the specified canvas context with the specified tic-tac-toe
 * cell.
 */
function drawX(context, coordinates) {
  var offset = gridToOffset(coordinates);
  var xOffset = offset.xOffset;
  var yOffset = offset.yOffset;

  context.beginPath();

  // Draw the first half of the 'X'.
  context.moveTo(xOffset + 25, yOffset + 25);
  context.lineTo(xOffset + 135, yOffset + 135);

  // Draw the second half of the 'X'.
  context.moveTo(xOffset + 25, yOffset + 135);
  context.lineTo(xOffset + 135, yOffset + 25);

  // Fill the lines.
  context.strokeStyle = '#f00';
  context.lineWidth = '4';
  context.stroke();
}

/**
 * Draws an 'X' on the specified canvas context with the specified tic-tac-toe
 * cell.
 */
function drawO(context, coordinates) {
  var offset = gridToOffset(coordinates);
  var xOffset = offset.xOffset;
  var yOffset = offset.yOffset;

  // Draw the 'O'.
  context.beginPath();
  context.arc(xOffset + 80, yOffset + 80, 55, 0, 2 * Math.PI);

  // Fill the lines.
  context.strokeStyle = '#00f';
  context.lineWidth = '4';
  context.stroke();
}

/**
 * Draws a line across the specified cells to indicate a winning move.
 */
function drawWinningLine(context, startCoordinates, endCoordinates) {
  var startOffset = gridToOffset(startCoordinates);
  var startXOffset = startOffset.xOffset;
  var startYOffset = startOffset.yOffset;
  var endOffset = gridToOffset(endCoordinates);
  var endXOffset = endOffset.xOffset;
  var endYOffset = endOffset.yOffset;

  // Draw a line from the center of the start cell to the center of the end
  // cell.
  context.beginPath();
  context.moveTo(startXOffset + 80, startYOffset + 80);
  context.lineTo(endXOffset + 80, endYOffset + 80);

  // Fill the line.
  context.strokeStyle = '#232';
  context.lineWidth = '12';
  context.stroke();
}

/**
 * Draws the game status information. E.g., the game room name, which player is
 * X and O, and who's turn it is.
 */
function displayGameStatus(context, gameName, game) {
  // Clear the canvas.
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  // Get the game status information.
  // TODO(vtsao): We should use anon auth to store player marks instead and read
  // from the datastore here instead of locally.
  var whoseX = tictactoe.player === 'X' ? 'You' : 'Them';
  var whoseO = tictactoe.player === 'O' ? 'You' : 'Them';
  var gameStatus = '';
  if (game.isGameOver) {
    if (game.hasOwnProperty('winningMove')) {
      gameStatus = game.isXTurn && tictactoe.player === 'X' ||
          !game.isXTurn && tictactoe.player === 'O' ? 'You win :)' :
          'They win :(';
    } else {
      gameStatus = 'Draw game :|';
    }
  } else {
    gameStatus = game.isXTurn && tictactoe.player === 'X' ||
        !game.isXTurn && tictactoe.player === 'O' ? 'Your turn.' :
        'Waiting for them...';
  }

  // Set common font style.
  context.font = '18px \'open sans\', arial, sans-serif';
  context.textBaseline = 'top';

  // Render the game name text.
  context.fillStyle = '#111';
  context.fillText('Game room: ' + gameName, 0, 0);

  // Render whose the X player.
  context.fillStyle = '#b00';
  context.fillText('X', 0, 18);
  context.fillStyle = '#111';
  context.fillText(' = ' + whoseX, 9, 18);

  // Render whose the O player.
  context.fillStyle = '#00b';
  context.fillText('O', 0, 36);
  context.fillStyle = '#111';
  context.fillText(' = ' + whoseO, 9, 36);

  // Render the game status, i.e., whose turn it is or who won if the game is
  // over.
  context.fillStyle = '#111';
  context.fillText(gameStatus, 0, 70);
}

/**
 * Draws X's and O's and end game visuals on the canvas based on the specified
 * game model state.
 */
function paintBoard(context, gameStatusContext, gameName, game) {
  // Clear the canvas.
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  drawBoard(context);

  // Render the game status.
  displayGameStatus(gameStatusContext, gameName, game);

  // Render the board.
  var board = game.board;
  for (var i = 0; i < board.cells.length; i++) {
    var mark = board.cells[i];
    var coordinates = unflattenCellIndex(i, board.width);
    if (mark === 'O') {
      drawO(context, coordinates);
    } else if (mark === 'X') {
      drawX(context, coordinates);
    }
  }

  // Render end game visuals as applicable.
  if (game.isGameOver) {
    if (game.hasOwnProperty('winningMove')) {
      drawWinningLine(
          context,
          unflattenCellIndex(game.winningMove.startIndex, board.width),
          unflattenCellIndex(game.winningMove.endIndex, board.width)
      );
    }
    // TODO(vtsao): Handle end game, i.e., allow player to start or join a new
    // game.
  }
}

