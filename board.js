module.exports = class Board {

  // top: 2,
  // right: 21,
  // bottom: 23,
  // left: 0,

  constructor(top, right, bottom, left, screen) {
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
    this.screen = screen;
  }

  topAndBottomBorder = '+--------------------+';

  draw(d) {

    d(this.left, this.top, this.topAndBottomBorder);

    for (let i = this.top + 1; i < this.bottom; i++) {
      d(this.left, i, '|');
    }

    for (let i = this.top + 1; i < this.bottom; i++) {
      d(this.right, i, '|');
    }

    this.drawBottomBorder(d);

    this.screen.draw();
  }

  drawBottomBorder(d) {
    d(this.left, this.bottom, this.topAndBottomBorder);
  }

};

