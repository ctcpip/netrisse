/* eslint-disable max-lines */

const { shapes } = require('./shapes');
const directions = require('./directions');

module.exports = class Shape {
  board;
  color;
  currentPoints = null; // current position on the board
  direction = 0; // index of points array indicating current shape direction
  offset = [0, 0]; // current offset
  points;
  screen;
  held = false;

  constructor(screen, board, shapeType) {
    this.screen = screen;
    this.board = board;
    this.shapeType = shapeType;
    Object.assign(this, shapes[shapeType]);
  }

  /**
   * start a new random shape
   */
  static createNewShape(screen, board, shapeType) {

    const s = new Shape(screen, board, shapeType);

    s.setInitialPosition();
    s.draw();
    s.drawGhost();
    s.screen.render();

    return s;

  }

  draw(clear) {

    for (let i = 0; i < this.currentPoints.length; i++) {
      const p = this.currentPoints[i];
      this.board.drawShapePoint(p, i, clear, this.color);
    }

    const xPointsForIndicator = [...new Set(this.currentPoints.map(p => p[0]))];

    for (const x of xPointsForIndicator) {
      this.board.setIndicator(x, clear);
    }

  }

  drawGhost(clear) {

    const { canMove, dropGhostShapePoints } = this.getDownDropGhostPositions();

    if (canMove || clear) {
      for (let i = 0; i < dropGhostShapePoints.length; i++) {
        const p = dropGhostShapePoints[i];
        this.board.drawShapePoint(p, i, clear, this.ghostColor, 'black');
      }
    }

  }

  setInitialPosition() {

    [this.currentPoints] = structuredClone(this.points);

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

  getDownDropGhostPositions() {

    let offsetY = 0;
    let dropGhostOffsetY = 0;

    const newShapePoints = structuredClone(this.currentPoints);

    let canMove = true;
    let returnCanMove = true;

    newShapePoints.map(p => {
      p[1] += 1;
      return p;
    });

    if (newShapePoints.some(p => this.board.isPointOccupied(p) || p[1] >= this.board.bottom)) {
      canMove = false;
      returnCanMove = false;
    }
    else {
      offsetY += 1;
      dropGhostOffsetY += 1;
    }

    const dropGhostShapePoints = structuredClone(newShapePoints);

    while (canMove) {
      dropGhostShapePoints.map(p => {
        p[1] += 1;
        return p;
      });

      if (dropGhostShapePoints.some(p => this.board.isPointOccupied(p) || p[1] >= this.board.bottom)) {
        canMove = false;
      }
      else {
        dropGhostOffsetY += 1;
      }
    }

    // if we are dropping, undo the last (failed) mutation of y values
    dropGhostShapePoints.map(p => {
      p[1] -= 1;
      return p;
    });

    return { canMove: returnCanMove, newShapePoints, dropGhostShapePoints, offsetY, dropGhostOffsetY };

  }

  move(direction) { // eslint-disable-line complexity

    if (this.board.gameOver || this.board.game.paused) {
      return;
    }

    this.board.moves.push(direction);

    if (this.board.concurrentExecutions > 0) {
      throw new Error('somehow got a race condition... must implement mutex');
    }

    this.board.concurrentExecutions += 1;

    let newShapePoints = structuredClone(this.currentPoints);

    let lockShape = false;
    let canMove = true;
    let gameOver = false;

    const offset = [0, 0];

    switch (direction) {
      case directions.AUTO:
      case directions.DOWN:
      case directions.DROP:
        {
          const downDropPositionData = this.getDownDropGhostPositions();

          if (direction === directions.DROP) {
            newShapePoints = downDropPositionData.dropGhostShapePoints;
          }
          else {
            ({ newShapePoints } = downDropPositionData);
          }

          if (downDropPositionData.canMove) {

            if (direction === directions.DROP) {
              offset[1] = downDropPositionData.dropGhostOffsetY;
            }
            else {
              offset[1] = downDropPositionData.offsetY;
            }

          }
          else if (direction === directions.AUTO) {
            // don't lock if the down direction was user input, only lock when auto-move activated
            lockShape = true;

            // check if game over.  if lowest y value (highest point of shape) is outside of top border, it's curtains! (probably)
            if (Math.min(...this.currentPoints.map(p => p[1])) <= this.board.top) { // eslint-disable-line max-depth
              gameOver = true;
            }

          }

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
          newShapePoints = structuredClone(this.points[newSelectedPoints]);

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
      this.drawGhost(true);
      this.draw(true);
      this.currentPoints = newShapePoints;
      this.offset[0] += offset[0];
      this.offset[1] += offset[1];
      this.drawGhost();
      this.draw();
      this.screen.render();

      if (direction === directions.AUTO) {
        this.board.currentTimeout = setTimeout(this.board.moveShapeAutomatically.bind(this.board), this.board.game.interval);
      }

    }

    this.board.concurrentExecutions -= 1;

  }

};
