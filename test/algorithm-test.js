/* eslint-disable guard-for-in */

const { easy, frustrationFree, random } = require('../algorithms');

const LOOP_COUNT = 1000000;
const deviationLoopCount = 10;

function getStandardDeviation(arr) {
  const { length } = arr;
  const mean = arr.reduce((a, b) => a + b) / length;
  return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / length);
}

function logDistribution(distribution) { // eslint-disable-line no-unused-vars
  for (const shape in distribution) {
    console.log(`${shape}: ${distribution[shape]}`);
  }
}

function getRandomStandardDeviation() {

  const algo = random();

  const distribution = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  for (let i = 0; i < LOOP_COUNT; i++) {
    distribution[algo.next().value] += 1;
  }

  // logDistribution(distribution);

  return Math.floor(getStandardDeviation(Object.values(distribution)));

}

function getEasyStandardDeviation() {

  const algo = easy();

  const distribution = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  for (let i = 0; i < LOOP_COUNT; i++) {
    distribution[algo.next().value] += 1;
  }

  // logDistribution(distribution);

  return Math.floor(getStandardDeviation(Object.values(distribution)));

}

function getFFStandardDeviation() {

  const algo = frustrationFree();

  const distribution = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  for (let i = 0; i < LOOP_COUNT; i++) {
    distribution[algo.next().value] += 1;
  }

  // logDistribution(distribution);

  return Math.floor(getStandardDeviation(Object.values(distribution)));

}

let acceptableDeviationLimit = 0;

// run the random loop 10x 1000000 to get 10 standard deviations.  use the max of the 10 to compare to other algos
for (let i = 0; i < deviationLoopCount; i++) {
  acceptableDeviationLimit = Math.max(acceptableDeviationLimit, getRandomStandardDeviation());
}

acceptableDeviationLimit *= 2; // padding it by double seems reasonable 🤷

console.log(`acceptable deviation limit: ${acceptableDeviationLimit}`);

const easyDeviation = getEasyStandardDeviation();

if (easyDeviation > 1) {
  throw new Error('easy deviation is unacceptable!');
}

console.log(`easy deviation: ${easyDeviation}`);

const ffDeviation = getFFStandardDeviation();

console.log(`frustration-free deviation: ${ffDeviation}`);

if (ffDeviation > acceptableDeviationLimit) {
  throw new Error(`frustration-free deviation ${ffDeviation} is unacceptable!  acceptable deviation limit is ${acceptableDeviationLimit}`);
}
