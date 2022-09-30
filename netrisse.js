/* eslint-disable max-lines */

const Board = require('./board');
const Screen = require('./screen');
const Game = require('./game');
const directions = require('./directions');
const algorithms = require('./algorithms');
const MersenneTwister = require('mersenne-twister');

const colorEnabled = true;
const interval = 0.5 * 1000;

const mainBoardPosition = [2, 21, 23, 0]; // top, right, bottom, left

const seed = new MersenneTwister().random_int();
// const seed = 3103172451;

const screen = new Screen(colorEnabled, interval, seed);
const game = new Game(interval, algorithms.frustrationFree);
const board = new Board(...mainBoardPosition, screen, game, seed, true);

game.boards.push(board);

const players = 1;

// players += 1;

if (players > 1) {
  const boardPosition = [mainBoardPosition[0], mainBoardPosition[1] * 3, mainBoardPosition[2], mainBoardPosition[1] * 2];
  const b = new Board(...boardPosition, screen, game, seed, false);
  game.boards.push(b);
}

function quit() {

  for (const b of game.boards) {
    b.stopAutoMoveTimer();
  }

  clearTimeout(screen.timeDisplayTimeout);
  screen.term.grabInput(false);
  screen.term.moveTo(board.left + 1, board.bottom + 1);
  screen.term.eraseLine();
  screen.term.hideCursor(false);
  // writeDebugInfo();
}

function writeDebugInfo() { // eslint-disable-line no-unused-vars
  console.log(`seed: ${seed}`);
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
