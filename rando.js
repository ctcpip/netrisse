const MersenneTwister = require('mersenne-twister');

module.exports = class Rando {

  constructor(seed) {
    this.rng = new MersenneTwister();
    this.rng.init_seed(seed);
  }

  /** a number between `0` (inclusive) and `max` (exclusive) */
  getRandomNumber(max) {
    return Math.floor(this.rng.random() * max);
  }

  random() {
    return this.rng.random();
  }

};

