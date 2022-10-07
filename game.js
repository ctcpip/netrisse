module.exports = class Game {

  paused = false;
  boards = [];

  constructor(interval, algorithm, client) {
    this.interval = interval;
    this.algorithm = algorithm;
    this.client = client;
  }

  pause(isRemote) {

    this.paused = !this.paused;

    // no need to call pause() on the other player boards
    this.boards[0].pause(isRemote);

  }

};
