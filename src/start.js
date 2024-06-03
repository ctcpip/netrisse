const Board = require('./board');
const Game = require('./game');
const directions = require('./directions');
const algorithms = require('./algorithms');

const quit = require('./quit');
const { debug, messageTypeEnum } = require('netrisse-lib'); // eslint-disable-line no-unused-vars
const withResolvers = require('promise.withresolvers');
withResolvers.shim();

module.exports = async function(seed, screen, mainBoardPosition, speed, client) {
  let thisPlayerIsPaused = false;
  let thisPlayerID = 0;

  let players = 1;
  players += 1;

  let promiseSeed, resolveSeed, rejectSeed;

  screen.clear();

  if (client) {
    thisPlayerID = client.playerID;

    // todo: add timeout to call rejectSeed
    ({ promise: promiseSeed, resolve: resolveSeed, reject: rejectSeed } = Promise.withResolvers()); // eslint-disable-line no-unused-vars

    client.ws.on('message', async rawData => {
      // debug(`${thisPlayerID} got ${rawData}`);
      const message = JSON.parse(rawData);

      // need to change to use the correct board for the player who sent the message
      switch (message.type) {
        case messageTypeEnum.CONNECT:
        {
          seed = await promiseSeed;

          for (const p of message.players) {
            if (p !== thisPlayerID) {
              const xOffset = 1;
              const boardPosition = {
                top: mainBoardPosition.top,
                right: (mainBoardPosition.right * 3) + xOffset,
                bottom: mainBoardPosition.bottom,
                left: (mainBoardPosition.right * 2) + xOffset,
              };
              const b = new Board(boardPosition, screen, game, seed);
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
          quit(screen, mainBoardPosition, game, client);
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
    seed = await promiseSeed;
  }

  screen.seed = seed;
  screen.showGameInfo(seed, speed);
  const game = new Game(speed, algorithms.frustrationFree, client, thisPlayerID);
  const board = new Board(mainBoardPosition, screen, game, seed);

  game.boards.push(board);

  if (players >= 1) {
    // for a multi-player game, pause at the start to allow players to join
    // for a single player game, also pause at the start...
    thisPlayerIsPaused = true;
    game.pause(true, thisPlayerID);
  }

  screen.term.on('key', name => {
    // the called methods should send the necessary message to the server, as there is no point in sending if it's a no-op (quick return)
    switch (name) {
      case 'j': case 'J': case 'LEFT':
        board.currentShape?.move(directions.LEFT);
        break;
      case 'k': case 'K': case 'UP':
        board.currentShape?.move(directions.ROTATE_LEFT);
        break;
      case 'l': case 'L': case 'RIGHT':
        board.currentShape?.move(directions.RIGHT);
        break;
      case ' ':
        board.currentShape?.move(directions.DROP);
        break;
      case 'm': case 'M': case 'DOWN':
        board.currentShape?.move(directions.DOWN);
        break;
      case 'h': case 'H':
        board.holdShape();
        break;
      case 'p': case 'P':
      {
        thisPlayerIsPaused = !thisPlayerIsPaused;
        const messageType = thisPlayerIsPaused ? messageTypeEnum.PAUSE : messageTypeEnum.UNPAUSE;
        client?.sendMessage(messageType, {});
        game.pause(thisPlayerIsPaused, thisPlayerID);
        break;
      }
      case 'CTRL_C': case 'ESCAPE': case 'Q': case 'q':
        quit(screen, mainBoardPosition, game, client);
        break;
      default:
        break;
    }
  });

  function writeDebugInfo() { // eslint-disable-line no-unused-vars
    console.log(`seed: ${seed}`);
    console.log(JSON.stringify(board.moves));
  }
};
