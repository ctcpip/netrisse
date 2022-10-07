const Board = require('./board');
const Screen = require('./screen');
const Game = require('./game');
const directions = require('./directions');
const algorithms = require('./algorithms');
const MersenneTwister = require('mersenne-twister');
const NetrisseClient = require('./client');

(async () => {
  // multiplayer game modes:  battle (default), friendly
  // need to wait to start the game until all players are ready (2nd board is not null)

  // need to deal with concurrency issues -- what if p1 paused the game, p2 does a hold (or move), successful on p2 screen but not p1 screen because game paused
  // probably change the logic to always allow the movement if it was not the main board

  // netris actually has a separate pause per player...
  // so basically, there can be _n_ pauses and only if it's 0 does the game continue

  const colorEnabled = true;
  const interval = 0.5 * 1000;
  // const interval = 30 * 1000;

  const mainBoardPosition = [2, 21, 23, 0]; // top, right, bottom, left

  let seed = new MersenneTwister().random_int();
  // const seed = 3103172451;

  let players = 1;
  players += 1;

  let client, game; // eslint-disable-line prefer-const

  if (players > 1) {
    client = new NetrisseClient('snoofism');
    client.connect(seed);

    let seedFromServer;

    client.ws.on('message', rawData => {
      // QUIT: 4, client
      // PAUSE: 3, server
      // QUIT: 4, server

      const message = JSON.parse(rawData);

      // need to change to use the correct board for the player who sent the message
      switch (message.type) {
        case client.messageTypeEnum.DIRECTION:
          game.boards[1].currentShape.move(message.direction);
          break;
        case client.messageTypeEnum.HOLD:
          game.boards[1].holdShape();
          break;
        case client.messageTypeEnum.PAUSE:
          game.pause(true);
          break;
        case client.messageTypeEnum.SEED:
          seedFromServer = message.seed;
          break;
        default:
          throw new Error(`unsupported message type: ${message.type}`);
      }
    });

    await retry(0.25, 100, () => !seedFromServer);

    if (seedFromServer) {
      seed = seedFromServer;
    }
    else {
      throw new Error('unable to get seed from server :(');
    }
  }

  const screen = new Screen(colorEnabled, interval, seed);
  game = new Game(interval, algorithms.frustrationFree, client);
  const board = new Board(...mainBoardPosition, screen, game, seed, true);

  game.boards.push(board);

  if (players > 1) {
    const xOffset = 1;
    const boardPosition = [mainBoardPosition[0], (mainBoardPosition[1] * 3) + xOffset, mainBoardPosition[2], (mainBoardPosition[1] * 2) + xOffset];  
    const b = new Board(...boardPosition, screen, game, seed, false);
    game.boards.push(b);
  }

  function quit() {
    for (const b of game.boards) {
      b.stopAutoMoveTimer();
    }

    clearTimeout(screen.timeDisplayTimeout);
    screen.term.grabInput(false);
    screen.term.moveTo(board.left + 1, board.bottom + 1);
    screen.term.eraseLine();
    screen.term.hideCursor(false);
    // writeDebugInfo();

    if (client) {
      client.disconnect();
    }
  }

  function writeDebugInfo() { // eslint-disable-line no-unused-vars
    console.log(`seed: ${seed}`);
    console.log(JSON.stringify(board.moves));
  }

  screen.term.on('key', name => {
    // the called methods should send the necessary message to the server, as there is no point in sending if it's a no-op (quick return)
    switch (name) {
      case 'j':
      case 'J':
      case 'LEFT':
        board.currentShape.move(directions.LEFT);
        break;
      case 'k':
      case 'K':
      case 'UP':
        board.currentShape.move(directions.ROTATE_LEFT);
        break;
      case 'l':
      case 'L':
      case 'RIGHT':
        board.currentShape.move(directions.RIGHT);
        break;
      case ' ':
        board.currentShape.move(directions.DROP);
        break;
      case 'm':
      case 'M':
      case 'DOWN':
        board.currentShape.move(directions.DOWN);
        break;
      case 'h':
      case 'H':
        board.holdShape();
        break;
      case 'p':
      case 'P':
        game.pause(false);
        break;
      case 'CTRL_C':
      case 'Q':
      case 'q':
      case 'ESCAPE':
        quit();
        break;
      default:
        break;
    }
  });

  /**
 * Retry a function until it returns false, or timeout expires
 * @param {number} timeout fractional minutes - length of time to retry
 * @param {number} pauseRate milliseconds - time to pause between retries (frequency)
 * @param {function} retryFunction function to retry - must return a boolean - function will be retried until it returns false
*/
  async function retry(timeout, pauseRate, retryFunction) {
    const start = new Date();

    while (new Date() - start < timeout * 60000 && await retryFunction()) {  
      await pause(pauseRate);  
    }
  }

  /**
 * Pause thread for an amount of time
 * @param {number} ms milliseconds to pause
 * @returns {promise}
 * @example
 * await pause(1 * 1000); // pause for 1 second
*/
  function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
})();
