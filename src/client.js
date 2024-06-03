const WS = require('ws');
const uuid = require('uuid');
const { Message, messageTypeEnum } = require('netrisse-lib');

module.exports = class NetrisseClient {
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

    const { promise, resolve, reject } = Promise.withResolvers();

    this.ws.on('error', reject);

    this.ws.on('open', () => {
      this.sendMessage(messageTypeEnum.CONNECT, { seed });
      resolve();
    });

    return promise;
  }

  disconnect() {
    this.ws.close(4333, JSON.stringify({ type: messageTypeEnum.QUIT, playerID: this.playerID, gameID: this.gameID }));
  }

  sendMessage(type, o) {
    this.ws.send(new Message(type, this.playerID, this.gameID, o).serialize(),
      err => {
        if (err) {
          throw new Error(err);
        }
      });
  }
};
