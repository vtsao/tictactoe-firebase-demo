/**
 * Controller that sets up the Tic-tac-toe game.
 *
 * TODO(vtsao): Update this code to dynamically draw the game elements for a
 * dynamic width. The data model is mostly there, it already does most things
 * dynamically. It's mostly the drawing utilities that need to be updated. There
 * are only a few hardcoded things in this file for a width 3 square grid. We
 * also currently assume a square grid. Tic-tac-toe is a m,n,k-game, so it would
 * be cool to allow configuring the game to take in a width and height and
 * dynamically setup the game to work properly with the specified w and h.
 *
 * TODO(vtsao): Add anonymous authentication and add security (validation).
 */

/** The Firebase data URL to use to read from and store data to. */
var FIRBASE_URL = 'INSERT_YOUR_FIREBASE_URL_HERE';

/**
 * The width of a tic-tac-toe board.
 */
var TICTACTOE_BOARD_WIDTH = 3;

var tictactoe = {
  /**
   * Takes the 2-D view coordinates of a cell and flattens it to an array index
   * for the data model.
   */
  flattenCellIndex: function(xCell, yCell, width) {
    return yCell * width + xCell;
  },

  /**
   * Checks the specified board to see if the consecutive cells in the specified
   * row, column, or diagonal are the same. If so, returns the first and last
   * cell's flattened index. Otherwise, returns null.
   */
  checkConsecutiveCells: function(
      board, player, xCell, yCell, increment, endCondition) {
    var startIndex = tictactoe.flattenCellIndex(xCell, yCell, board.width);
    for (var i = 0; i < endCondition; i += increment) {
      if (board.cells[startIndex + i] !== player) {
        break;
      } else if (i + increment >= endCondition) {
        return {startIndex: startIndex, endIndex: startIndex + i};
      }
    }

    return null;
  },

  /**
   * Checks the game board to see if the specified move is a winning move.
   */
  checkForWinningMove: function(player, board, xCell, yCell) {
    var winningMove = null;

    // Check the row for the win.
    winningMove = tictactoe.checkConsecutiveCells(
        board, player, 0, yCell, 1, board.width);
    if (winningMove !== null) {
      return winningMove;
    }

    // Check the column for the win.
    winningMove = tictactoe.checkConsecutiveCells(
        board, player, xCell, 0, board.width, board.cells.length);
    if (winningMove !== null) {
      return winningMove;
    }

    // Check the diagonal for the win.
    if (xCell === yCell) {
      winningMove = tictactoe.checkConsecutiveCells(
          board, player, 0, 0, board.width + 1, board.cells.length);
      if (winningMove !== null) {
        return winningMove;
      }
    }

    // Check the other diagonal for the win.
    if (xCell + yCell === board.width - 1) {
      winningMove = tictactoe.checkConsecutiveCells(board, player,
          board.width - 1, 0, board.width - 1,
          board.cells.length - board.width);
      if (winningMove !== null) {
        return winningMove;
      }
    }

    return winningMove;
  },

  /**
   * Checks the game board to see if the game is a draw.
   */
  checkForDraw: function(cells) {
    for (var i = 0; i < cells.length; i++) {
      if (cells[i] === '') {
        return false;
      }
    }
    return true;
  },

  /**
   * Marks the cell as the player who clicked it.
   */
  markCell: function(xCell, yCell) {
    // Retrieve the game state from Firebase.
    tictactoe.gameInstance.once('value', function(dataSnapshot) {
      var game = dataSnapshot.val();

      // Check if the game is over.
      if (game.isGameOver) {
        return;
      }

      // Check to see if it's this player's turn.
      if (!(game.isXTurn && tictactoe.player === 'X' ||
          !game.isXTurn && tictactoe.player === 'O')) {
        return;
      }

      // Check to see if the cell this player clicked on is empty.
      if (game.board.cells[tictactoe.flattenCellIndex(xCell, yCell,
          game.board.width)] !== '') {
        return;
      }

      // Mark it as the player's cell and update whose turn it is.
      game.board.cells[tictactoe.flattenCellIndex(xCell, yCell,
          game.board.width)] = tictactoe.player;

      // See if this move was a winning move. If not, check to see if the
      // game is a draw.
      var winningMove = tictactoe.checkForWinningMove(
          tictactoe.player, game.board, xCell, yCell);
      if (winningMove !== null || tictactoe.checkForDraw(game.board.cells)) {
        // If it is a winning move, set end game attributes.
        game.winningMove = winningMove;
        game.isGameOver = true;
      } else {
        // Don't change the player if this player won.
        game.isXTurn = !game.isXTurn;
      }

      // Update the game state on Firebase.
      tictactoe.gameInstance.set(game);
    })
  },

  /**
   * Handles what happens when a user clicks on the tic-tac-toe board.
   */
  canvasClickEventHandler: function(e) {
    // Get the coordinates in the canvas of the click.
    var rect = tictactoe.canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    // Calculate which cell the click was in.
    var xCell = Math.floor(x / 160);
    var yCell = Math.floor(y / 160);

    tictactoe.markCell(xCell, yCell);
  },

  /**
   * Handles how the view renders when the game's data model changes.
   */
  gameChangedEventHandler: function(dataSnapshot) {
    paintBoard(tictactoe.context, tictactoe.gameStatusContext,
        dataSnapshot.key(), dataSnapshot.val());
  },

  /**
   * Creates a JSON representation of a tic-tac-toe board of the specified
   * width. This is the schema and data model that represents the initial state
   * of the board.
   */
  createBoardModel: function(width) {
    var board = {
      cells: [],
      width: width
    };

    // Initially all cells are empty, represented by the empty string.
    for (var i = 0; i < Math.pow(width, 2); i++) {
      board.cells.push('');
    }

    return board;
  },

  /**
   * Handles how to start the game.
   */
  gameStartEventHandler: function(e) {
    // Retrieve the name of the game room the user entered.
    var gameRoom = $('#room-name').val();
    if (gameRoom === '') {
      alert('You need to enter a game room name!');
      return;
    } else {
      tictactoe.gameRoom = gameRoom;
      // Remove the game room input text and buttons and show the game status
      // canvas.
      $('#game-room').hide();
      $('#game-status').css('display', 'block');
    }

    // Create a reference to our Firebase datastore.
    // TODO(vtsao): Handle rooms better. (1) track if a room is full or not and
    // don't let somebody join a full room. (2) don't let somebody join a room
    // that doesn't exist. (3) remove a room's data after the game is over, but
    // leave the canvas rendering.
    tictactoe.fb = new Firebase(FIRBASE_URL);
    tictactoe.gameInstance = tictactoe.fb.child('games/' + tictactoe.gameRoom);

    // If the user started a new game, initialize its data model.
    if (e.data.isNew) {
      tictactoe.gameInstance.set({
        board: tictactoe.createBoardModel(e.data.boardWidth),
        isXTurn: true,
        isGameOver: false
      });
      // Player who started the game is always 'X'.
      // TODO(vtsao): This is not the best way to do this, we should use
      // Firebase's anonymous auth and store each player's mark in the
      // datastore instead of locally.
      tictactoe.player = 'X';
    } else {
      tictactoe.player = 'O';
    }

    // Add a listener to handle what to do when the board data model changes.
    tictactoe.gameInstance.on('value', tictactoe.gameChangedEventHandler);

    // Enable the board for play!
    $('#canvas').click(tictactoe.canvasClickEventHandler);
  },

  /**
   * Initializes the tic-tac-toe game.
   */
  init: function(e) {
    tictactoe.canvas = $('#canvas').get(0);
    tictactoe.context = tictactoe.canvas.getContext('2d');

    tictactoe.gameStatusCanvas = $('#game-status').get(0);
    tictactoe.gameStatusContext = tictactoe.gameStatusCanvas.getContext('2d');

    // Setup the game.
    drawBoard(tictactoe.context);
    $('#new').click({isNew: true, boardWidth: TICTACTOE_BOARD_WIDTH},
        tictactoe.gameStartEventHandler);
    $('#join').click({isNew: false}, tictactoe.gameStartEventHandler);
  }
};

$(document).ready(tictactoe.init);

