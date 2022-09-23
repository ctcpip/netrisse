/* eslint-disable max-lines */

const Board = require('./board');
const Screen = require('./screen');
const Game = require('./game');
const directions = require('./directions');

const colorEnabled = true;
const interval = 0.5 * 1000;

const screen = new Screen(colorEnabled);
const game = new Game(interval);
const board = new Board(2, 21, 23, 0, screen, game);

function quit() {
  clearTimeout(board.currentTimeout);
  screen.term.grabInput(false);
  screen.term.moveTo(board.left + 1, board.bottom + 1);
  screen.term.eraseLine();
  screen.term.hideCursor(false);
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
    case 'm':
    case 'M':
    case 'DOWN':
      board.currentShape.move(directions.DOWN);
      break;
    case ' ':
      board.currentShape.move(directions.DROP);
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
