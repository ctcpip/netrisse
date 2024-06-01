const { shapes } = require('./shapes');
const Shape = require('./shape');
const directions = require('./directions');
const Rando = require('./rando');
const { messageTypeEnum } = require('netrisse-lib');

const BOARD_WIDTH = 20;

// TODO: write game code above board in amber color

module.exports = class Board {
  currentShape;
  currentTimeout;
  occupiedPoints = [];
  concurrentExecutions = 0;
  moves = [];
  replay = false; // used for debugging,
  heldShape;
  nextShapeType = null;
  score = 0n;
  linesCleared = 0;
  gameOver = false;

  constructor(top, right, bottom, left, screen, game, seed, playerID) {
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
    this.screen = screen;
    this.game = game;
    this.algorithm = game.algorithm(seed);
    this.playerID = playerID;
    this.rando = new Rando(seed);

    if (this.isMainBoard) {
      this.nextBox = {};
      this.nextBox.top = this.top;
      this.nextBox.left = this.right + 2;
      this.nextBox.right = this.nextBox.left + 11;
      this.nextBox.bottom = this.nextBox.top + 5;

      this.holdBox = structuredClone(this.nextBox);
      this.holdBox.top = this.holdBox.bottom + 1;
      this.holdBox.bottom = this.holdBox.top + 5;
    }

    this.draw();

    if (this.replay) {
      const theMoves = [3, 0, 2, 2, 2, 0, 0, 0, 6, 0, 2, 0, 3, 3, 0, 6, 0, 1, 1, 0, 1, 0, 2, 3, 2, 2, 0, 6, 0, 0, 1, 3, 1, 0, 1, 1, 1, 1, 0, 6, 0, 1, 1, 0, 3, 3, 0, 3, 2, 2, 0, 2, 2, 0, 6, 0, 1, 0, 0, 3, 2, 0, 6, 0, 0, 1, 1, 0, 6, 0, 0, 3, 1, 0, 3, 3, 0, 3, 3, 0, 3, 0, 3, 1, 0, 6, 0, 0, 0, 3, 2, 0, 1, 6, 0, 0, 0, 0, 1, 0, 2, 0, 2, 3, 0, 1, 1, 0, 6, 0, 1, 0, 3, 1, 3, 3, 1, 0, 1, 1, 1, 6, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 6, 0, 1, 0, 3, 2, 0, 2, 0, 6, 0, 0, 1, 0, 0, 0, 2, 2, 0, 2, 2, 2, 0, 6, 0, 1, 0, 3, 1, 1, 0, 6, 0, 0, 1, 3, 0, 3, 3, 0, 1, 6, 0, 0, 0, 3, 0, 1, 0, 6, 0, 0, 0, 0, 3, 2, 0, 1, 1, 0, 1, 1, 1, 1, 0, 6, 0, 0, 0, 3, 3, 0, 2, 2, 2, 0, 1, 6, 0, 0, 3, 3, 0, 3, 0, 2, 2, 2, 0, 6, 0, 0, 3, 1, 1, 0, 3, 3, 0, 3, 3, 1, 0, 6, 0, 0, 0, 3, 1, 1, 1, 0, 1, 1, 1, 6, 0, 0, 3, 2, 0, 2, 2, 2, 2, 0, 6, 0, 0, 2, 2, 0, 6, 0, 0, 3, 1, 3, 0, 3, 1, 0, 6, 0, 0, 3, 0, 3, 2, 0, 2, 6, 0, 0, 2, 3, 2, 2, 0, 2, 2, 2, 0, 6, 0];

      for (const direction of theMoves) {
        this.currentShape.move(direction);
      }
    }
  }

  get isMainBoard() {
    return this.game.boards.length === 0 || this.game.boards[0] === this;
  }

  topBorder = '┏━━━━━━━━━━━━━━━━━━━━┓';
  bottomBorder = '┗━━━━━━━━━━━━━━━━━━━━┛';
  heldShapeTopBorder = '┏━━━━━━━━━━┓';
  heldShapeBottomBorder = '┗━━━━━━━━━━┛';

  drawBoard() {
    this.screen.d(this.left, this.top, this.topBorder);

    for (let i = this.top + 1; i < this.bottom; i++) {
      this.screen.d(this.left, i, '┃');
    }

    for (let i = this.top + 1; i < this.bottom; i++) {
      this.screen.d(this.right, i, '┃');
    }

    this.drawBottomBorder();
  }

  drawNextBox() {
    if (!this.isMainBoard) { return; }

    this.screen.d(this.nextBox.left, this.nextBox.top, this.heldShapeTopBorder);

    this.screen.d(this.nextBox.left + 4, this.nextBox.top + 1, 'NEXT');

    for (let i = this.nextBox.top + 1; i < this.nextBox.bottom; i++) {
      this.screen.d(this.nextBox.left, i, '┃');
    }

    for (let i = this.nextBox.top + 1; i < this.nextBox.bottom; i++) {
      this.screen.d(this.nextBox.right, i, '┃');
    }

    this.screen.d(this.nextBox.left, this.nextBox.bottom, this.heldShapeBottomBorder);
  }

  drawHoldBox() {
    if (!this.isMainBoard) { return; }

    this.screen.d(this.holdBox.left, this.holdBox.top, this.heldShapeTopBorder);

    this.screen.d(this.holdBox.left + 4, this.holdBox.top + 1, 'HOLD');

    for (let i = this.holdBox.top + 1; i < this.holdBox.bottom; i++) {
      this.screen.d(this.holdBox.left, i, '┃');
    }

    for (let i = this.holdBox.top + 1; i < this.holdBox.bottom; i++) {
      this.screen.d(this.holdBox.right, i, '┃');
    }

    this.screen.d(this.holdBox.left, this.holdBox.bottom, this.heldShapeBottomBorder);
  }

  draw() {
    this.drawBoard();
    this.drawNextBox();
    this.drawHoldBox();
    this.drawScore();
    this.screen.render();
  }

  drawBottomBorder() {
    this.screen.d(this.left, this.bottom, this.bottomBorder);
  }

  drawGameOver(text) {
    const lines = text.split(' ');
    const firstLineY = Math.floor(this.bottom / 2) - 7;

    // clear out some space on the board
    for (let i = 0; i < 9; i++) {
      for (let i2 = this.left + 1; i2 < this.right; i2++) {
        this.screen.d(i2, firstLineY - 1 + i, ' ');
      }
    }

    // display text centered on the board
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      this.screen.d(Math.ceil((this.right + this.left) / 2) - Math.ceil((l.length / 2)), firstLineY + i, l, { color: 'brightRed' });
    }

    const scoreLines = [`Score: ${this.score}`, `Lines: ${this.linesCleared}`];
    for (let i = 0; i < scoreLines.length; i++) {
      const l = scoreLines[i];
      this.screen.d(Math.ceil((this.right + this.left) / 2) - Math.ceil((l.length / 2)), firstLineY + i + lines.length + 1, l);
    }
  }

  drawScore() {
    if (!this.isMainBoard) { return; }

    this.screen.d(this.right + 3, 15, `Score: ${this.score}`);
    this.screen.d(this.right + 3, 16, `Lines: ${this.linesCleared}`);
  }

  addScore(linesCleared) {
    this.score += BigInt(this.factorial(linesCleared) * 50);
    this.linesCleared += linesCleared;
    this.drawScore();
  }

  setIndicator(x, clear) {
    this.screen.d(x, this.bottom, clear ? '━' : '=');
  }

  startNewShape() {
    this.drawBottomBorder(); // reset bottom border indicator

    let newShapeType;

    if (this.nextShapeType === null) {
      newShapeType = this.algorithm.next().value;
    }
    else {
      newShapeType = this.nextShapeType;
      this.drawHeldShape(this.nextShapeType, true, false);
    }

    this.nextShapeType = this.algorithm.next().value;
    this.currentShape = Shape.createNewShape(this.screen, this, newShapeType);
    this.resetAutoMoveTimer();

    this.drawHeldShape(this.nextShapeType, false, false);
    this.screen.render();
  }

  moveShapeAutomatically() {
    this.currentShape.move(directions.AUTO);
  }

  isPointOccupied(p) {
    for (const op of this.occupiedPoints) {
      if (op[0] === p[0] && op[1] === p[1]) { return true; }
    }

    return false;
  }

  clearLines(gameOver) {
    // get the Y's of current points (only need to check these y lines are full)
    // iterate them in order of highest Y to lowest (start clearing lines from the bottom of the board)
    const ys = [...new Set(this.currentShape.currentPoints.map(p => p[1]))].sort().reverse();

    let linesCleared = 0;

    const erasePoints = [];

    // loop through cleared lines, move the lines above down by one
    for (const originalY of ys) {
      // if we cleared any lines, we need to adjust where we're looking for the next cleared line
      const y = originalY + linesCleared;

      const linePoints = this.occupiedPoints.filter(op => op[1] === y);

      if (linePoints.length === BOARD_WIDTH) {
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

      if (this.isMainBoard) {
        this.sendJunk(linesCleared);
      }

      // eslint-disable-next-line no-unused-vars
      gameOver = false; // give them another chance if they cleared lines...
    }
  }

  sendJunk(linesCleared) {
    /*
      +----------------+-------------+
      | Lines Cleared  |  Junk Lines |
      +----------------+-------------+
      |              1 |           0 |
      |              2 |           1 |
      |              3 |           2 |
      |              4 |           4 |
      +----------------+-------------+
    */
    const junkLines = linesCleared === 4 ? 4 : linesCleared - 1;

    if (junkLines > 0) {
      this.game.sendJunk(junkLines);
    }
  }

  lockShape() {
    let gameOver = false;

    this.occupiedPoints.push(...this.currentShape.currentPoints);

    // check if game over.  if lowest y value (highest point of shape) is outside of top border, it's curtains! (probably)
    if (Math.min(...this.currentShape.currentPoints.map(p => p[1])) <= this.top) {
      gameOver = true;
    }

    this.clearLines(gameOver);

    if (gameOver) {
      this.gameOver = true;
      this.drawGameOver(`IT'S CURTAINS FOR YOU!`);
      this.screen.render();
    }
    else {
      this.startNewShape();
    }
  }

  factorial(n) { return !(n > 1) ? 1 : this.factorial(n - 1) * n; }

  setPauseText() {
    let txtPaused = 'Game paused';

    if (this.game.isPausedByThisPlayer) {
      txtPaused += ' by you';
    }
    else {
      txtPaused += '       '; // padding to clear out the pause text when another player is paused, but current player isn't
    }

    if (this.game.isPaused) {
      this.screen.d(24, 21, txtPaused, { color: 'brightRed' });
    }
    else {
      for (let i = 0; i < txtPaused.length; i++) {
        this.screen.d(24 + i, 21, ' ');
      }
    }

    this.screen.render();
  }

  pause() {
    if (this.game.isPaused) {
      this.stopAutoMoveTimer();
    }
    else {
      this.resetAutoMoveTimer();
    }
  }

  holdShape() {
    if (this.currentShape?.held || this.game.isPaused) {
      // current shape cannot be held more than once
      return;
    }

    if (this.isMainBoard) {
      this.game.client?.sendMessage(messageTypeEnum.HOLD);
    }

    this.stopAutoMoveTimer();

    let copyHeldShape;

    if (this.heldShape) {
      copyHeldShape = new Shape(this.screen, this, this.heldShape.shapeType); // copy the existing heldShape before we reassign
      copyHeldShape.held = true;
      this.drawHeldShape(this.heldShape.shapeType, true, true); // clear out the existing held shape in the box
    }

    // hold the current shape
    this.currentShape.held = true;
    this.heldShape = this.currentShape;

    // remove current shape from board
    this.currentShape.drawGhost(true);
    this.currentShape.draw(true);

    // release the currently held shape if it exists, otherwise start a new shape
    if (copyHeldShape) {
      this.drawBottomBorder(); // reset bottom border indicator

      this.currentShape = copyHeldShape;
      this.currentShape.direction = 0;
      this.currentShape.offset = [0, 0];
      this.currentShape.setInitialPosition();
      this.currentShape.draw();
      this.currentShape.drawGhost();

      this.screen.render();

      this.resetAutoMoveTimer();
    }
    else {
      this.startNewShape();
    }

    this.drawHeldShape(this.heldShape.shapeType, false, true);
    this.screen.render();
  }

  drawHeldShape(shapeType, clear, isHold) {
    if (!this.isMainBoard) {
      return;
    }

    const s = shapes[shapeType];

    // get starting points for the shape
    const [points] = structuredClone(s.points);

    let offsetX, boxOffsetX, boxOffsetY;

    switch (shapeType) {
      case 0: // should really change this to use an enum instead of array index...
        // if it's the I shape, shift 1 to the left
        offsetX = -1;
        break;
      case 3:
        // if it's the O shape, shift 1 to the right
        offsetX = 1;
        break;
      default:
        offsetX = 0;
        break;
    }

    if (isHold) {
      boxOffsetX = this.holdBox.left;
      boxOffsetY = this.holdBox.top;
    }
    else {
      boxOffsetX = this.nextBox.left;
      boxOffsetY = this.nextBox.top;
    }

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p[0] += boxOffsetX + 6 + offsetX;
      p[1] += boxOffsetY + 3;
      this.drawShapePoint(p, i, clear, s.color);
    }
  }

  drawShapePoint(p, i, clear, bgColor, color = 'black') {
    // don't draw if point is outside of bounds
    if (p[1] > this.top) {
      if (clear) {
        this.screen.d(...p, ' ');
      }
      else {
        const content = i % 2 === 0 ? '[' : ']';

        if (this.screen.colorEnabled) {
          this.screen.d(...p, content, { color, bgColor });
        }
        else {
          this.screen.put({ x: p[0], y: p[1], attr: { inverse: true } }, content);
        }
      }
    }
  }

  stopAutoMoveTimer() {
    clearTimeout(this.currentTimeout);
  }

  resetAutoMoveTimer() {
    if (!this.replay && this.isMainBoard) {
      this.stopAutoMoveTimer();
      this.currentTimeout = setTimeout(this.moveShapeAutomatically.bind(this), this.game.interval);
    }
  }

  /**
   * gets the lowest Y value occupied on the board
   */
  getHighestOccupiedPoint() {
    return Math.min(...this.occupiedPoints.map(op => op[1]));
  }

  receiveJunk(junkLines) {
    const erasePoints = [];

    this.currentShape.drawGhost(true);

    // move lines up, point by point
    for (const p of this.occupiedPoints) {
      const sp = this.screen.get({ x: p[0], y: p[1] });

      erasePoints.push([p[0], p[1]]); // pass values of, not the ref to p, because we modify the position on the next line

      p[1] -= junkLines; // update the point location

      this.screen.put({ x: p[0], y: p[1], attr: sp.attr }, sp.char); // draw the point in its new location
    }

    // depending on whether a board's border is odd or even, affects:
    // 1. where we need to calculate for the junk hole
    // 2. the characters used for drawing junk shapes
    const startingXIsOdd = this.left % 2 === 0;

    // make junk holes align, with x chosen randomly
    const holeX = this.rando.getRandomOddOrEvenNumber(this.left, this.right, startingXIsOdd);

    for (let y = this.bottom - junkLines; y < this.bottom; y++) {
      for (let x = this.left + 1; x < this.right; x++) {
        if (x !== holeX && x !== holeX + 1) {
          const p = [x, y];
          this.occupiedPoints.push(p);
          this.drawShapePoint(p, x - (startingXIsOdd ? 1 : 0), false, 'grey');
        }
      }
    }

    for (const ep of erasePoints) {
      if (!this.isPointOccupied(ep)) {
        this.screen.d(...ep, ' '); // erase the point
      }
    }

    this.currentShape.drawGhost();
    this.screen.render();
  }

  quit(isGameOver) {
    // they could quit before the game is started
    if (this.game.started) {
      this.clearLines(true);
    }
    const txt = isGameOver ? 'GAME OVER' : `PLAYER HAS QUIT 😿`;

    this.gameOver = true;
    this.drawGameOver(txt);
    this.screen.render();
  }
};
