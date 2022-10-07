const WS = require('ws');
const uuid = require('uuid');

module.exports = class NetrisseClient {
  messageTypeEnum = Object.freeze({
    CONNECT: 0,
    DIRECTION: 1,
    HOLD: 2,
    PAUSE: 3,
    QUIT: 4,
    SEED: 5,
  });

  constructor(gameID, server = 'localhost:4752') {
    if (typeof gameID === 'undefined') {
      throw new Error('gameID cannot be undefined!');
    }
    else {
      this.gameID = gameID;
    }

    this.server = server;
    this.playerID = uuid.v4();
  }

  connect(seed) {
    this.ws = new WS(`ws://${this.server}`);

    this.ws.on('error', err => {
      throw new Error(err); // do something here
    });

    this.ws.on('open', () => {
      this.sendMessage({ seed }, this.messageTypeEnum.CONNECT);
    });
  }

  disconnect() {
    this.ws.close();
  }

  sendMessage(o = {}, type) {
    this.ws.send(JSON.stringify(Object.assign(o, { type, playerID: this.playerID, gameID: this.gameID })));
  }
};
