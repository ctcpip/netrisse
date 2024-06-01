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

  /** an odd or even number between `min` (inclusive) and `max` (inclusive) */
  getRandomOddOrEvenNumber(min, max, wantOdd) {
    if (min > max) {
      [min, max] = [max, min];
    }

    let randomNumber = Math.floor(this.rng.random() * (max - min + 1)) + min;
    const isEven = randomNumber % 2 === 0;

    if (isEven) {
      if (wantOdd) {
        // if the number is even, add 1 to make it odd
        randomNumber += 1;
        // if adding 1 is out of range, subtract 2 instead
        if (randomNumber > max) {
          randomNumber -= 2;
        }
      }
    }
    else {
      if (!wantOdd) {
        // if the number is odd, add 1 to make it even
        randomNumber += 1;
        // if adding 1 is out of range, subtract 2 instead
        if (randomNumber > max) {
          randomNumber -= 2;
        }
      }
    }

    return randomNumber;
  }

  random() {
    return this.rng.random();
  }
};
