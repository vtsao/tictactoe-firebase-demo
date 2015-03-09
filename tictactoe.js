/**
 * Description...
 */

/** The Firebase data URL to use to read from and store data to. */
var FIRBASE_URL = 'INSERT_YOUR_FIREBASE_URL_HERE';

/**
 * Draws the tic-tac-toe board.
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
  context.stroke();
}

/**
 * Draws an 'X'.
 */
function drawX(context, xOffset, yOffset) {
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
 * Draws an 'O'.
 */
function drawO(context, xOffset, yOffset) {
  context.beginPath();
  context.arc(xOffset + 80, yOffset + 80, 55, 0, 2 * Math.PI);

  // Fill the lines.
  context.strokeStyle = '#00f';
  context.lineWidth = '4';
  context.stroke();
}

/**
 * Marks the cell as the player who clicked it.
 */
function markCell(context, xCell, yCell) {
  // Calculates which cell to draw in.
  var xOffset = xCell * 160;
  var yOffset = yCell * 160;

  // TODO(vtsao): Add logic to figure out which mark to draw.
  // drawX(context, xOffset, yOffset);
  drawO(context, xOffset, yOffset);
}

/**
 * 
 */
function canvasClickEventHandler(e) {
  // Get the coordinates in the canvas of the click.
  var rect = e.data.canvas.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;
  console.log('x: ' + x);
  console.log('y: ' + y);

  // Calculate which cell the click was in.
  var xCell = Math.floor(x/160);
  var yCell = Math.floor(y/160);
  console.log('xCell: ' + xCell);
  console.log('yCell: ' + yCell);

  markCell(e.data.context, xCell, yCell);
}

/**
 * Entry point.
 */
function main() {
  var canvas = $('#canvas').get(0);
  var context = canvas.getContext('2d');

  // Setup the board.
  drawBoard(context);
  $('#canvas').click({canvas: canvas, context: context},
      canvasClickEventHandler);
}

$(document).ready(main);

