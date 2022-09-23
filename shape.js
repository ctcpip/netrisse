const { shapes } = require('./shapes');
const clone = require('rfdc')();
const { getRandomNumber } = require('./random');
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
    const randomShape = shapes[getRandomNumber(shapes.length)];
    this.color = randomShape.color;
    this.points = randomShape.points;

  }

  draw(clear) {
    for (let i = 0; i < this.currentPoints.length; i++) {
      const p = this.currentPoints[i];

      // don't draw if point is outside of bounds
      if (p[1] > this.board.top) {

        const content = i % 2 === 0 ? '[' : ']';

        if (clear) {
          this.screen.d(...p, ' ');
        }
        else if (this.screen.colorEnabled) {
          this.screen.d(...p, content, { color: 'black', bgColor: this.color });
        }
        else {
          this.screen.screen.put({ x: p[0], y: p[1], attr: { inverse: true } }, content);
        }
      }

      this.board.setIndicator(p[0], clear);

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

    let newShapePoints = clone(this.currentPoints);

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

          if (newShapePoints.some(p => this.isPointOccupied(p) || p[1] >= this.board.bottom)) {

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

        if (newShapePoints.some(p => this.isPointOccupied(p) || p[0] < this.board.left)) {
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

        if (newShapePoints.some(p => this.isPointOccupied(p) || p[0] > this.board.right)) {
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

          canMove = newShapePoints.every(p => p[0] >= this.board.left && p[0] <= this.board.right && p[1] < this.board.bottom);

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
      this.board.occupiedPoints.push(...this.currentPoints);

      // get the Y's of current points (only need to check these y lines are full)
      const ys = this.currentPoints.map(p => p[1]);

      let highestClearedY = 64; // technically it's the _lowest_ number on the plane
      let linesCleared = 0;

      for (const y of ys) {

        const linePoints = this.board.occupiedPoints.filter(op => op[1] === y);

        if (linePoints.length === 20) {
          // line is full; clear it
          for (const p of linePoints) {
            this.screen.d(...p, ' ');
          }

          // remove from occupiedPoints array
          this.board.occupiedPoints = this.board.occupiedPoints.filter(op => op[1] !== y);

          highestClearedY = Math.min(highestClearedY, y);
          linesCleared += 1;

        }

      }

      const erasePoints = [];

      if (linesCleared > 0) {
        // move lines above cleared lines down by num of cleared lines, point by point

        for (const p of this.board.occupiedPoints.filter(op => op[1] < highestClearedY)) {

          const sp = this.screen.get({ x: p[0], y: p[1] });

          console.log(`yee: ${JSON.stringify(sp)}`);

          erasePoints.push([p[0], p[1]]);

          p[1] += linesCleared; // update the point location

          this.screen.put({ x: p[0], y: p[1], attr: sp.attr }, sp.char); // draw the point in its new location

        }

        for (const ep of erasePoints) {
          if (!this.isPointOccupied(ep)) {
            this.screen.d(...ep, ' '); // erase the point
          }
        }

        this.screen.render();

      }

      this.board.startNewShape();
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

  }

  isPointOccupied(p) {
    for (const op of this.board.occupiedPoints) {
      if (op[0] === p[0] && op[1] === p[1]) { return true; }
    }

    return false;
  }

};
