const MersenneTwister = require('mersenne-twister');
const Rando = require('../src/rando');
const assert = require('node:assert');

const seed = new MersenneTwister().random_int();
const rando = new Rando(seed);
const max = 33;

let foundNumbers = new Set();

while (foundNumbers.size <= max) {
  const odd = rando.getRandomOddOrEvenNumber(0, max, true);
  const even = rando.getRandomOddOrEvenNumber(0, max, false);
  foundNumbers.add(odd);
  foundNumbers.add(even);
}

assert.strictEqual(foundNumbers.size, max + 1);

foundNumbers = new Set();

while (foundNumbers.size <= max) {
  const n = rando.getRandomNumber(34);
  foundNumbers.add(n);
}

assert.strictEqual(foundNumbers.size, max + 1);
