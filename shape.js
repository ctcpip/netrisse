/* eslint-disable max-lines */

const { shapes } = require('./shapes');
const clone = require('rfdc')();
const directions = require('./directions');

module.exports = class Shape {
  board;
  color;
  currentPoints = null; // current position on the board
  direction = 0; // index of points array indicating current shape direction
  offset = [0, 0]; // current offset
  points;
  screen;

  constructor(screen, board) {

    this.screen = screen;
    this.board = board;

    // const randomShape = shapes[3]; // eslint-disable-line
    const randomShape = shapes[this.board.algorithm.next().value];
    this.color = randomShape.color;
    this.points = randomShape.points;

    this.setInitialPosition();
    this.draw();
    this.screen.render();

  }

  drawShapePoint(p, i, clear) {

    // don't draw if point is outside of bounds
    if (p[1] > this.board.top) {

      if (clear) {
        this.screen.d(...p, ' ');
      }
      else {

        const content = i % 2 === 0 ? '[' : ']';

        if (this.screen.colorEnabled) {
          this.screen.d(...p, content, { color: 'black', bgColor: this.color });
        }
        else {
          this.screen.put({ x: p[0], y: p[1], attr: { inverse: true } }, content);
        }

      }

    }

    this.board.setIndicator(p[0], clear);

  }

  draw(clear) {
    for (let i = 0; i < this.currentPoints.length; i++) {
      const p = this.currentPoints[i];
      this.drawShapePoint(p, i, clear);
    }
  }

  setInitialPosition() {

    [this.currentPoints] = clone(this.points);

    const x = ((this.board.right + 1) / 2) + 1; // eslint-disable-line no-extra-parens

    let y = this.board.top;

    // get the furthest Y point of the shape
    const maxY = this.currentPoints.map(p => p[1]).reduce((a, b) => Math.max(a, b), -Infinity);

    if (maxY === 0) {
      // move down 1 so shape is visible
      y += 1;
    }

    this.offset[0] += x;
    this.offset[1] += y;

    for (const p of this.currentPoints) {
      p[0] += x;
      p[1] += y;
    }

  }

  move(direction) { // eslint-disable-line complexity

    this.board.moves.push(direction);

    if (this.board.gameOver) {
      return;
    }

    if (this.board.concurrentExecutions > 0) {
      throw new Error('somehow got a race condition... must implement mutex');
    }

    this.board.concurrentExecutions += 1;

    let newShapePoints = clone(this.currentPoints);

    let lockShape = false;
    let canMove = true;
    let gameOver = false;

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

          if (newShapePoints.some(p => this.board.isPointOccupied(p) || p[1] >= this.board.bottom)) {

            canMove = false;

            if (direction === directions.AUTO) {
              // don't lock if the down direction was user input, only lock when auto-move activated
              lockShape = true;

              // check if game over.  if lowest y value (highest point of shape) is outside of top border, it's curtains! (probably)
              if (Math.min(...this.currentPoints.map(p => p[1])) <= this.board.top) { // eslint-disable-line max-depth
                gameOver = true;
              }

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

        if (newShapePoints.some(p => this.board.isPointOccupied(p) || p[0] < this.board.left)) {
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

        if (newShapePoints.some(p => this.board.isPointOccupied(p) || p[0] > this.board.right)) {
          canMove = false;
        }
        else {
          offset[0] = 2;
        }

        break;

      case directions.ROTATE_LEFT:
      {

        // o shape can't rotate
        if (this.points.length > 1) {

          const newSelectedPoints = this.direction === 0 ? this.points.length - 1 : this.direction - 1;
          newShapePoints = clone(this.points[newSelectedPoints]);

          // apply offset
          for (const p of newShapePoints) {
            p[0] += this.offset[0];
            p[1] += this.offset[1];
          }

          if (newShapePoints.some(p => this.board.isPointOccupied(p))) {
            canMove = false;
          }
          else {
            canMove = newShapePoints.every(p => p[0] >= this.board.left && p[0] <= this.board.right && p[1] < this.board.bottom);
          }

          if (canMove) {
            this.direction = newSelectedPoints;
          }

        }

        break;
      }

      default:
        throw new Error('like a rolling stone!');
    }

    if (lockShape) {
      this.board.lockShape(gameOver);
    }
    else if (canMove) {
      this.draw(true);
      this.currentPoints = newShapePoints;
      this.offset[0] += offset[0];
      this.offset[1] += offset[1];
      this.draw();
      this.screen.render();

      if (direction === directions.AUTO) {
        this.board.currentTimeout = setTimeout(this.board.moveShapeAutomatically.bind(this.board), this.board.game.interval);
      }

    }

    this.board.concurrentExecutions -= 1;

  }

};

