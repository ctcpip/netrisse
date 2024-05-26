const termkit = require('terminal-kit');
const packageJSON = require('./package.json');

module.exports = class Screen {
  constructor(colorEnabled, interval, seed) {
    this.colorEnabled = colorEnabled;
    this.term = termkit.terminal;
    this.term.windowTitle('Netrisse');
    this.screen = new termkit.ScreenBuffer({ dst: this.term, noFill: true });
    this.seed = seed;
    this.interval = interval;

    this.term.hideCursor();

    if (this.colorEnabled) {
      this.screen.fill({ attr: { bgColor: 'black' } });
    }
    else {
      this.screen.fill({ attr: { bgDefaultColor: true } });
    }

    this.d(0, 0, `Netrisse ${packageJSON.version} (C) 2022  Chris de Almeida           "netrisse -h" for more info`);

    this.term.grabInput();

    this.d(24, 19, `Seed:  ${this.seed}`);
    this.d(24, 20, `Speed: ${this.interval}ms`);

    this.displayTime();
    this.timeDisplayTimeout = setTimeout(this.displayTime.bind(this), 1000);
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

  displayTime() {
    const date = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    const time = new Intl.DateTimeFormat('en', options).format(date);

    this.d(24, 22, time);

    this.render();
  }
};
