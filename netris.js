/* eslint-disable max-lines */

const termkit = require('terminal-kit');
const clone = require('rfdc')();
const MersenneTwister = require('mersenne-twister');
const { shapes } = require('./shapes');
const Board = require('./board');

const term = termkit.terminal;
const screen = new termkit.ScreenBuffer({ dst: term, noFill: true });
const colorEnabled = true;

if (colorEnabled) {
  screen.fill({ attr: { bgColor: 'black' } });
}
else {
  screen.fill({ attr: { bgDefaultColor: true } });
}

d(0, 0, 'Netris JS 0.1.0 (C) 2022  Chris de Almeida         "netris -h" for more info');

const board = new Board(2, 21, 23, 0, screen);

/**
 * draw
 */
function d(x, y, content, { color = 'white', bgColor = 'black' } = { color: 'white', bgColor: 'black' }) {

  if (colorEnabled) {
    screen.put({ x, y, attr: { color, bgColor } }, content);
  }
  else {
    screen.put({ x, y }, content);
  }

}

board.draw(d);

const rng = new MersenneTwister();
const seed = rng.random_int();
rng.init_seed(seed);

/** a number between `0` (inclusive) and `max` (exclusive) */
function getRandomNumber(max) {
  return Math.floor(rng.random() * max);
}

term.hideCursor();
let currentTimeout, currentShape;

let occupiedPoints = [];

function quit() {
  clearTimeout(currentTimeout);
  term.grabInput(false);
  term.moveTo(board.left + 1, board.bottom + 1);
  term.eraseLine();
  term.hideCursor(false);
}

term.grabInput();

const interval = 0.5 * 1000;

function startNewShape() {
  board.drawBottomBorder(d); // reset bottom border indicator
  // currentShape = clone(shapes[3]);
  currentShape = clone(shapes[getRandomNumber(shapes.length)]);
  setInitialPosition(currentShape);
  drawShape();
  screen.draw();
  currentTimeout = setTimeout(moveShapeAutomatically, interval);
}

startNewShape();

function drawShape(clear) {
  for (let i = 0; i < currentShape.currentPoints.length; i++) {
    const p = currentShape.currentPoints[i];

    // don't draw if point is outside of bounds
    if (p[1] > board.top) {

      const content = i % 2 === 0 ? '[' : ']';

      if (clear) {
        d(...p, ' ');
      }
      else if (colorEnabled) {
        d(...p, content, { color: 'black', bgColor: currentShape.color });
      }
      else {
        screen.put({ x: p[0], y: p[1], attr: { inverse: true } }, content);
      }
    }

    setIndicator(p[0], clear);

  }
}

function setIndicator(x, clear) {
  d(x, board.bottom, clear ? '-' : '=');
}

const directions = Object.freeze({
  AUTO: 0,
  LEFT: 1,
  RIGHT: 2,
  ROTATE_LEFT: 3,
  ROTATE_RIGHT: 4, // not implemented
  DOWN: 5,
  DROP: 6,
});

function moveShapeAutomatically() {
  moveShape(directions.AUTO);
}

function isPointOccupied(p) {
  for (const op of occupiedPoints) {
    if (op[0] === p[0] && op[1] === p[1]) { return true; }
  }

  return false;
}

function moveShape(direction) { // eslint-disable-line complexity

  let newShapePoints = clone(currentShape.currentPoints);

  let lockShape = false;
  let canMove = true;

  const offset = [0, 0];

  switch (direction) {
    case directions.AUTO:
    case directions.DOWN:
    case directions.DROP:

      do {

        newShapePoints.map(p => {
          p[1] += 1;
          return p;
        });

        if (newShapePoints.some(p => isPointOccupied(p) || p[1] >= board.bottom)) {

          canMove = false;

          if (direction === directions.AUTO) {
          // don't lock if the down direction was user input, only lock when auto-move activated
            lockShape = true;
          }

        }
        else {
          offset[1] += 1;
        }

      } while (direction === directions.DROP && canMove);

      // if we are dropping, undo the last (failed) mutation of y values
      if (direction === directions.DROP && !canMove) {
        canMove = true;
        newShapePoints.map(p => {
          p[1] -= 1;
          return p;
        });
      }

      break;
    case directions.LEFT:
      newShapePoints.map(p => {
        p[0] -= 2;
        return p;
      });

      if (newShapePoints.some(p => isPointOccupied(p) || p[0] < board.left)) {
        canMove = false;
      }
      else {
        offset[0] = -2;
      }

      break;
    case directions.RIGHT:
      newShapePoints.map(p => {
        p[0] += 2;
        return p;
      });

      if (newShapePoints.some(p => isPointOccupied(p) || p[0] > board.right)) {
        canMove = false;
      }
      else {
        offset[0] = 2;
      }

      break;

    case directions.ROTATE_LEFT:
    {

      // o shape can't rotate
      if (currentShape.points.length > 1) {

        const newSelectedPoints = currentShape.direction === 0 ? currentShape.points.length - 1 : currentShape.direction - 1;
        newShapePoints = clone(currentShape.points[newSelectedPoints]);

        // apply offset
        for (const p of newShapePoints) {
          p[0] += currentShape.offset[0];
          p[1] += currentShape.offset[1];
        }

        canMove = newShapePoints.every(p => p[0] >= board.left && p[0] <= board.right && p[1] < board.bottom);

        if (canMove) {
          currentShape.direction = newSelectedPoints;
        }

      }

      break;
    }

    default:
      throw new Error('like a rolling stone!');
  }

  if (lockShape) {
    occupiedPoints.push(...currentShape.currentPoints);

    // get the Y's of current points (only need to check these y lines are full)
    const ys = currentShape.currentPoints.map(p => p[1]);

    let highestClearedY = 64; // technically it's the _lowest_ number on the plane
    let linesCleared = 0;

    for (const y of ys) {

      const linePoints = occupiedPoints.filter(op => op[1] === y);

      if (linePoints.length === 20) {
        // line is full; clear it
        for (const p of linePoints) {
          d(...p, ' ');
        }

        // remove from occupiedPoints array
        occupiedPoints = occupiedPoints.filter(op => op[1] !== y);

        highestClearedY = Math.min(highestClearedY, y);
        linesCleared += 1;

      }

    }

    const erasePoints = [];

    if (linesCleared > 0) {
      // move lines above cleared lines down by num of cleared lines, point by point

      for (const p of occupiedPoints.filter(op => op[1] < highestClearedY)) {

        const sp = screen.get({ x: p[0], y: p[1] });

        erasePoints.push([p[0], p[1]]);

        p[1] += linesCleared; // update the point location

        screen.put({ x: p[0], y: p[1], attr: sp.attr }, sp.char); // draw the point in its new location

      }

      for (const ep of erasePoints) {
        if (!isPointOccupied(ep)) {
          d(...ep, ' '); // erase the point
        }
      }

      screen.draw();

    }

    startNewShape();
  }
  else if (canMove) {
    drawShape(true);
    currentShape.currentPoints = newShapePoints;
    currentShape.offset[0] += offset[0];
    currentShape.offset[1] += offset[1];
    drawShape();
    screen.draw();

    if (direction === directions.AUTO) {
      currentTimeout = setTimeout(moveShapeAutomatically, interval);
    }

  }

}

term.on('key', name => { // eslint-disable-line complexity

  switch (name) {
    case 'j':
    case 'J':
    case 'LEFT':
      moveShape(directions.LEFT);
      break;
    case 'k':
    case 'K':
    case 'UP':
      moveShape(directions.ROTATE_LEFT);
      break;
    case 'l':
    case 'L':
    case 'RIGHT':
      moveShape(directions.RIGHT);
      break;
    case 'm':
    case 'M':
    case 'DOWN':
      moveShape(directions.DOWN);
      break;
    case ' ':
      moveShape(directions.DROP);
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

function setInitialPosition() {

  [currentShape.currentPoints] = clone(currentShape.points);

  const x = ((board.right + 1) / 2) + 1; // eslint-disable-line no-extra-parens

  let y = board.top;

  // get the furthest Y point of the shape
  const maxY = currentShape.currentPoints.map(p => p[1]).reduce((a, b) => Math.max(a, b), -Infinity);

  if (maxY === 0) {
    // move down 1 so shape is visible
    y += 1;
  }

  currentShape.offset[0] += x;
  currentShape.offset[1] += y;

  for (const p of currentShape.currentPoints) {
    p[0] += x;
    p[1] += y;
  }

}
