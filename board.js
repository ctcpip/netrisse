const Shape = require('./shape');
const directions = require('./directions');

module.exports = class Board {

  currentShape;
  currentTimeout;
  occupiedPoints = [];
  concurrentExecutions = 0;
  moves = [];
  replay = false; // used for debugging,

  constructor(top, right, bottom, left, screen, game) {
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
    this.screen = screen;
    this.game = game;
    this.algorithm = game.algorithm();
    this.score = 0n;
    this.linesCleared = 0;
    this.gameOver = false;
    this.draw();
    this.startNewShape();

    if (this.replay) {

      const theMoves = [3, 0, 2, 2, 2, 0, 0, 0, 6, 0, 2, 0, 3, 3, 0, 6, 0, 1, 1, 0, 1, 0, 2, 3, 2, 2, 0, 6, 0, 0, 1, 3, 1, 0, 1, 1, 1, 1, 0, 6, 0, 1, 1, 0, 3, 3, 0, 3, 2, 2, 0, 2, 2, 0, 6, 0, 1, 0, 0, 3, 2, 0, 6, 0, 0, 1, 1, 0, 6, 0, 0, 3, 1, 0, 3, 3, 0, 3, 3, 0, 3, 0, 3, 1, 0, 6, 0, 0, 0, 3, 2, 0, 1, 6, 0, 0, 0, 0, 1, 0, 2, 0, 2, 3, 0, 1, 1, 0, 6, 0, 1, 0, 3, 1, 3, 3, 1, 0, 1, 1, 1, 6, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 6, 0, 1, 0, 3, 2, 0, 2, 0, 6, 0, 0, 1, 0, 0, 0, 2, 2, 0, 2, 2, 2, 0, 6, 0, 1, 0, 3, 1, 1, 0, 6, 0, 0, 1, 3, 0, 3, 3, 0, 1, 6, 0, 0, 0, 3, 0, 1, 0, 6, 0, 0, 0, 0, 3, 2, 0, 1, 1, 0, 1, 1, 1, 1, 0, 6, 0, 0, 0, 3, 3, 0, 2, 2, 2, 0, 1, 6, 0, 0, 3, 3, 0, 3, 0, 2, 2, 2, 0, 6, 0, 0, 3, 1, 1, 0, 3, 3, 0, 3, 3, 1, 0, 6, 0, 0, 0, 3, 1, 1, 1, 0, 1, 1, 1, 6, 0, 0, 3, 2, 0, 2, 2, 2, 2, 0, 6, 0, 0, 2, 2, 0, 6, 0, 0, 3, 1, 3, 0, 3, 1, 0, 6, 0, 0, 3, 0, 3, 2, 0, 2, 6, 0, 0, 2, 3, 2, 2, 0, 2, 2, 2, 0, 6, 0];

      for (const direction of theMoves) {
        this.currentShape.move(direction);
      }

    }

  }

  topAndBottomBorder = '+--------------------+';

  draw() {

    this.screen.d(this.left, this.top, this.topAndBottomBorder);

    for (let i = this.top + 1; i < this.bottom; i++) {
      this.screen.d(this.left, i, '|');
    }

    for (let i = this.top + 1; i < this.bottom; i++) {
      this.screen.d(this.right, i, '|');
    }

    this.drawBottomBorder();
    this.drawScore();

    this.screen.render();
  }

  drawBottomBorder() {
    this.screen.d(this.left, this.bottom, this.topAndBottomBorder);
  }

  drawGameOver() {

    const lines = `IT'S CURTAINS FOR YOU!`.split(' ');
    const firstLineY = Math.floor(this.bottom / 2) - 4;

    // clear out some space on the board
    for (let i = 0; i < 6; i++) {

      for (let i2 = this.left + 1; i2 < this.right; i2++) {
        this.screen.d(i2, firstLineY - 1 + i, ' ');
      }

    }

    // display text centered on the board
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      this.screen.d(Math.ceil(this.right / 2) - Math.ceil((l.length / 2)), firstLineY + i, l, { color: 'red' }); // eslint-disable-line no-extra-parens
    }

  }

  drawScore() {
    this.screen.d(this.right + 3, this.bottom - 6, `Score: ${this.score}`);
    this.screen.d(this.right + 3, this.bottom - 5, `Lines: ${this.linesCleared}`);
  }

  addScore(linesCleared) {
    this.score += BigInt(this.factorial(linesCleared) * 50);
    this.linesCleared += linesCleared;
    this.drawScore();
  }

  setIndicator(x, clear) {
    this.screen.d(x, this.bottom, clear ? '-' : '=');
  }

  startNewShape() {
    this.drawBottomBorder(); // reset bottom border indicator
    this.currentShape = new Shape(this.screen, this);
    this.currentTimeout = setTimeout(this.moveShapeAutomatically.bind(this), this.game.interval);
  }

  moveShapeAutomatically() {
    if (!this.replay) {
      this.currentShape.move(directions.AUTO);
    }
  }

  isPointOccupied(p) {
    for (const op of this.occupiedPoints) {
      if (op[0] === p[0] && op[1] === p[1]) { return true; }
    }

    return false;
  }

  clearLines(gameOver) {

    // get the Y's of current points (only need to check these y lines are full)
    // iterate them in order of higest Y to lowest (start clearing lines from the bottom of the board)
    const ys = [...new Set(this.currentShape.currentPoints.map(p => p[1]))].sort().reverse();

    let linesCleared = 0;

    const erasePoints = [];

    // loop through cleared lines, move the lines above down by one
    for (const originalY of ys) {

      // if we cleared any lines, we need to adjust where we're looking for the next cleared line
      const y = originalY + linesCleared;

      const linePoints = this.occupiedPoints.filter(op => op[1] === y);

      if (linePoints.length === 20) {
        // line is full; clear it
        erasePoints.push(...linePoints);

        // remove from occupiedPoints array
        this.occupiedPoints = this.occupiedPoints.filter(op => op[1] !== y);

        linesCleared += 1;

        // move lines above cleared lines down, point by point
        for (const p of this.occupiedPoints.filter(op => op[1] < y)) {

          const sp = this.screen.get({ x: p[0], y: p[1] });

          erasePoints.push([p[0], p[1]]); // pass values of, not the ref to p, because we modify the position on the next line

          p[1] += 1; // update the point location

          this.screen.put({ x: p[0], y: p[1], attr: sp.attr }, sp.char); // draw the point in its new location

        }

      }

    }

    if (linesCleared > 0) {

      for (const ep of erasePoints) {
        if (!this.isPointOccupied(ep)) {
          this.screen.d(...ep, ' '); // erase the point
        }
      }

      this.addScore(linesCleared);

      this.screen.render();

      // eslint-disable-next-line no-param-reassign, no-unused-vars
      gameOver = false; // give them another chance if they cleared lines...

    }

  }

  lockShape(gameOver) {

    this.occupiedPoints.push(...this.currentShape.currentPoints);
    this.clearLines(gameOver);

    if (gameOver) {
      this.gameOver = true;
      this.drawGameOver();
      this.screen.render();
    }
    else {
      this.startNewShape();
    }

  }

  factorial(n) { return !(n > 1) ? 1 : this.factorial(n - 1) * n; } // eslint-disable-line no-negated-condition

};

