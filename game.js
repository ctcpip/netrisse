module.exports = class Game {

  paused = false;
  boards = [];

  constructor(interval, algorithm) {
    this.interval = interval;
    this.algorithm = algorithm;
  }

  pause() {

    this.paused = !this.paused;

    for (const b of this.boards) {
      b.pause();
    }

  }

};
