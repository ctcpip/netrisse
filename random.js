const MersenneTwister = require('mersenne-twister');

const rng = new MersenneTwister();
const seed = rng.random_int();
// const seed = 3103172451;
rng.init_seed(seed);

/** a number between `0` (inclusive) and `max` (exclusive) */
function getRandomNumber(max) {
  return Math.floor(rng.random() * max);
}

function random() {
  return rng.random();
}

module.exports = { getRandomNumber, rngRandom: random, seed };
