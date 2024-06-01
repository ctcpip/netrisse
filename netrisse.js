const Board = require('./board');
const Screen = require('./screen');
const Game = require('./game');
const directions = require('./directions');
const algorithms = require('./algorithms');
const MersenneTwister = require('mersenne-twister');
const NetrisseClient = require('./client');
const { debug, messageTypeEnum } = require('netrisse-lib');
const withResolvers = require('promise.withresolvers');

withResolvers.shim();

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

  const seed = new MersenneTwister().random_int();
  // const seed = 3103172451;

  let thisPlayerIsPaused = false;
  let thisPlayerID = 0;

  let players = 1;
  players += 1;

  let client, game, screen, promiseSeed, resolveSeed, rejectSeed, seedFromServer; // eslint-disable-line prefer-const

  if (players > 1) {
    client = new NetrisseClient('snoofism');
    client.connect(seed);

    thisPlayerID = client.playerID;

    // todo: add timeout to call rejectSeed
    ({ promise: promiseSeed, resolve: resolveSeed, reject: rejectSeed } = Promise.withResolvers()); // eslint-disable-line no-unused-vars

    client.ws.on('message', async rawData => {
      debug(`${thisPlayerID} got ${rawData}`);
      const message = JSON.parse(rawData);

      // need to change to use the correct board for the player who sent the message
      switch (message.type) {
        case messageTypeEnum.CONNECT:
        {
          seedFromServer = await promiseSeed;

          for (const p of message.players) {
            if (p !== thisPlayerID) {
              const xOffset = 1;
              const boardPosition = [mainBoardPosition[0], (mainBoardPosition[1] * 3) + xOffset, mainBoardPosition[2], (mainBoardPosition[1] * 2) + xOffset];
              const b = new Board(...boardPosition, screen, game, seedFromServer);
              game.boards.push(b);
              game.pause(true, p);
            }
          }

          break;
        }

        case messageTypeEnum.DIRECTION:
          game.boards[1].currentShape.move(message.direction);
          break;
        case messageTypeEnum.GAME_OVER:
          game.gameOver();
          quit();
          break;
        case messageTypeEnum.HOLD:
          game.boards[1].holdShape();
          break;

        case messageTypeEnum.JUNK:
        {
          const b = game.boards.find(b2 => b2.playerID === message.toPlayerID);
          b.receiveJunk(message.junkLines);
          break;
        }

        case messageTypeEnum.PAUSE:
          game.pause(true, message.playerID);
          break;
        case messageTypeEnum.QUIT:
          game.boards[1].quit();
          break;
        case messageTypeEnum.SEED:
          resolveSeed(message.seed);
          break;
        case messageTypeEnum.UNPAUSE:
          game.pause(false, message.playerID);
          break;
        default:
          throw new Error(`unsupported message type: ${message.type}`);
      }
    });
  }

  seedFromServer = await promiseSeed;
  screen = new Screen(colorEnabled, interval, seedFromServer);
  game = new Game(interval, algorithms.frustrationFree, client, thisPlayerID);
  const board = new Board(...mainBoardPosition, screen, game, seedFromServer);

  game.boards.push(board);

  if (players > 1) {
    // for a multi-player game, pause at the start to allow players to join
    thisPlayerIsPaused = true;
    game.pause(true, thisPlayerID);
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
        board.currentShape?.move(directions.LEFT);
        break;
      case 'k':
      case 'K':
      case 'UP':
        board.currentShape?.move(directions.ROTATE_LEFT);
        break;
      case 'l':
      case 'L':
      case 'RIGHT':
        board.currentShape?.move(directions.RIGHT);
        break;
      case ' ':
        board.currentShape?.move(directions.DROP);
        break;
      case 'm':
      case 'M':
      case 'DOWN':
        board.currentShape?.move(directions.DOWN);
        break;
      case 'h':
      case 'H':
        board.holdShape();
        break;

      case 'p':
      case 'P':
      {
        thisPlayerIsPaused = !thisPlayerIsPaused;

        const messageType = thisPlayerIsPaused ? messageTypeEnum.PAUSE : messageTypeEnum.UNPAUSE;

        client?.sendMessage(messageType, {});
        game.pause(thisPlayerIsPaused, thisPlayerID);
        break;
      }

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
})();
