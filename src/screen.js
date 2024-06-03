const termkit = require('terminal-kit');
const packageJSON = require('../package.json');

module.exports = class Screen {
  constructor(colorEnabled) {
    this.colorEnabled = colorEnabled;
    this.term = termkit.terminal;
    this.term.windowTitle('Netrisse');
    this.screen = new termkit.ScreenBuffer({ dst: this.term, noFill: true });
    this.term.hideCursor();
    this.term.grabInput();
  }

  showGameInfo(seed, speed) {
    this.d(24, 19, `Seed:  ${seed}`);
    this.d(24, 20, `Speed: ${speed}ms`);

    this.displayTime();
    this.timeDisplayTimeout = setTimeout(this.displayTime.bind(this), 1000);
  }

  /**
 * draw
 */
  d(x, y, content, { color = 'white', bgColor = 'black' } = { color: 'white', bgColor: 'black' }) {
    const attr = this.colorEnabled ? { color, bgColor } : {};
    this.screen.put({ x, y, attr }, content);
  }

  render() {
    this.screen.draw({ delta: false });
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

  clear() {
    const attr = this.colorEnabled ? { bgColor: 'black' } : { bgDefaultColor: true };
    this.screen.fill({ attr, region: this.writableArea });
    this.d(0, 0, `Netrisse ${packageJSON.version} (C) 2016  Chris de Almeida           "netrisse -h" for more info`);
  }
};
