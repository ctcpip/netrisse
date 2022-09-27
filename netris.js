/* eslint-disable max-lines */

const Board = require('./board');
const Screen = require('./screen');
const Game = require('./game');
const directions = require('./directions');
const algorithms = require('./algorithms');

const colorEnabled = true;
const interval = 0.5 * 1000;

const screen = new Screen(colorEnabled, interval);
const game = new Game(interval, algorithms.frustrationFree);
const board = new Board(2, 21, 23, 0, screen, game);

game.boards.push(board);

function quit() {
  clearTimeout(board.currentTimeout);
  clearTimeout(screen.timeDisplayTimeout);
  screen.term.grabInput(false);
  screen.term.moveTo(board.left + 1, board.bottom + 1);
  screen.term.eraseLine();
  screen.term.hideCursor(false);
  // writeDebugInfo();
}

function writeDebugInfo() { // eslint-disable-line no-unused-vars
  console.log(`seed: ${screen.seed}`);
  console.log(JSON.stringify(board.moves));
}

screen.term.on('key', name => { // eslint-disable-line complexity

  switch (name) {
    case 'j':
    case 'J':
    case 'LEFT':
      board.currentShape.move(directions.LEFT);
      break;
    case 'k':
    case 'K':
    case 'UP':
      board.currentShape.move(directions.ROTATE_LEFT);
      break;
    case 'l':
    case 'L':
    case 'RIGHT':
      board.currentShape.move(directions.RIGHT);
      break;
    case ' ':
      board.currentShape.move(directions.DROP);
      break;
    case 'm':
    case 'M':
    case 'DOWN':
      board.currentShape.move(directions.DOWN);
      break;
    case 'h':
    case 'H':
      board.holdShape();
      break;
    case 'p':
    case 'P':
      game.pause();
      break;
    case 'CTRL_C':
    case 'Q':
    case 'q':
    case 'ESCAPE':
      quit();
      break;
    default:
      break;
  }

});
