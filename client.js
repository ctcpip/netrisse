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

    this.ws.on('error', err => {
      throw new Error(err); // do something here
    });

    this.ws.on('open', () => {
      this.sendMessage(messageTypeEnum.CONNECT, { seed });
    });
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
