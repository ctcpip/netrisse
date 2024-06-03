const config = require('./config');
const start = require('./start');
const quit = require('./quit');
const multiplayer = require('./multiplayer');

module.exports = function intro(screen, seed) {
  const mainBoardPosition = { top: 2, right: 21, bottom: 23, left: 0 };

  let cursorY = 3;

  screen.clear();
  screen.d(2, cursorY, '✨ Welcome to Netrisse! 🎉', { color: 'green' });
  screen.d(5, cursorY += 3, '1) Single player  🧍', { color: 'amber' });
  screen.d(5, cursorY += 2, '2) Multiplayer  🧑‍🤝‍🧑', { color: 'amber' });
  screen.d(5, cursorY += 2, '3) Options  🔧', { color: 'amber' });
  screen.d(5, cursorY += 2, 'Q) Quit  🚪', { color: 'brightred' });
  screen.render();

  const keyHandler = name => {
    switch (name) {
      case '1':
        screen.term.removeListener('key', keyHandler);
        start(seed, screen, mainBoardPosition, config.speed, null);
        break;
      case '2':
        screen.term.removeListener('key', keyHandler);
        multiplayer(screen, seed, intro, mainBoardPosition);
        break;
      case 'CTRL_C': case 'ESCAPE': case 'Q': case 'q':
        quit(screen, mainBoardPosition);
        break;
    }
  };

  screen.term.on('key', keyHandler);
};
