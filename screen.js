const termkit = require('terminal-kit');

module.exports = class Screen {

  constructor(colorEnabled) {

    this.colorEnabled = colorEnabled;
    this.term = termkit.terminal;
    this.screen = new termkit.ScreenBuffer({ dst: this.term, noFill: true });

    this.term.hideCursor();

    if (this.colorEnabled) {
      this.screen.fill({ attr: { bgColor: 'black' } });
    }
    else {
      this.screen.fill({ attr: { bgDefaultColor: true } });
    }

    this.d(0, 0, 'Netris JS 0.1.0 (C) 2022  Chris de Almeida         "netris -h" for more info');

    this.term.grabInput();

  }

  /**
 * draw
 */
  d(x, y, content, { color = 'white', bgColor = 'black' } = { color: 'white', bgColor: 'black' }) {

    if (this.colorEnabled) {
      this.screen.put({ x, y, attr: { color, bgColor } }, content);
    }
    else {
      this.screen.put({ x, y }, content);
    }

  }

  render() {
    this.screen.draw();
  }

  get(...args) {
    return this.screen.get(...args);
  }

  put(...args) {
    this.screen.put(...args);
  }

};

