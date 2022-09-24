/* eslint-disable guard-for-in */

const { getRandomNumber, rngRandom } = require('./random');

const shapes = [0, 1, 2, 3, 4, 5, 6];
const OLD_SHAPE_THRESHOLD = 21; // the number of turns a shape hasn't been seen for it to be weighted more by the algorithm
const logStuff = false;

function getOldestShape(shapeLastSeen) {

  let oldestTurns = 0;
  let oldestShape;

  for (const s in shapeLastSeen) {

    const turns = shapeLastSeen[s];

    if (turns > oldestTurns) {
      oldestTurns = turns;
      oldestShape = s;
    }

  }

  return oldestTurns >= OLD_SHAPE_THRESHOLD ? oldestShape : null;

}

function log(t) {
  if (logStuff) {
    console.log(t);
  }
}

module.exports = {

  /**
   * this algorithm:
   * - selects a random shape
   * - if we haven't seen a shape in a while (21 turns), try up to 3x to get it
   * - if the shape is the same as one of the last two shapes, try once to get a different shape
   */
  *frustrationFree() {

    const LAST_SHAPE_THRESHOLD = 2; // the number of recent turns where if a shape appeared, we try to get another shape

    // init all values with LAST_SHAPE_THRESHOLD to prevent hitting the recent shape logic
    const shapeLastSeen = {
      0: LAST_SHAPE_THRESHOLD,
      1: LAST_SHAPE_THRESHOLD,
      2: LAST_SHAPE_THRESHOLD,
      3: LAST_SHAPE_THRESHOLD,
      4: LAST_SHAPE_THRESHOLD,
      5: LAST_SHAPE_THRESHOLD,
      6: LAST_SHAPE_THRESHOLD,
    };

    while (true) {

      let shape;

      shape = getRandomNumber(shapes.length);

      const oldestShape = getOldestShape(shapeLastSeen);

      // if we have a shape that hasn't been seen in a while, try to get it
      if (oldestShape && oldestShape !== shape) {

        log(`haven't seen shape ${oldestShape} in a while...`);

        // try up to three times to get the old shape
        for (let i = 0; i < 3; i++) {

          shape = getRandomNumber(shapes.length);

          if (shape === oldestShape) {
            break;
          }

        }

      }

      // if we saw the shape in the last two turns, try once to get a different shape
      if (shapeLastSeen[shape] < LAST_SHAPE_THRESHOLD) {
        log(`saw ${shape} too recently.. try to find another`);
        shape = getRandomNumber(shapes.length);
      }

      for (const s in shapeLastSeen) {

        if (parseInt(s) === shape) {
          shapeLastSeen[s] = 0;
        }
        else {
          shapeLastSeen[s] += 1;
        }
      }

      log(`yielded shape ${shape}`);

      yield shape;

    }

  },

  /**
   * this algorithm:
   * - creates a collection of 3x each shape (21 total)
   * - distributes the shapes randomly until all 21 are gone, and repeats this cycle forever
   * - if the random shape is the same as the last shape, try up to 3x to get a different shape
   */
  *easy() {

    let easyShapes = [];
    let lastShape;

    while (true) {

      if (easyShapes.length === 0) {
        // create a collection of 3x the shapes list
        easyShapes = shapes.concat(shapes, shapes);
        shuffle(easyShapes);
      }

      let shape, shapeIndex;

      // try up to three times to get a different shape than the previous shape
      for (let i = 0; i < 3; i++) {

        shapeIndex = getRandomNumber(easyShapes.length);
        shape = easyShapes[shapeIndex];

        if (shape !== lastShape) {
          break;
        }

      }

      easyShapes.splice(shapeIndex, 1);
      lastShape = shape;

      yield shape;

    }
  },
  *random() {
    while (true) {
      yield getRandomNumber(shapes.length);
    }
  }
};

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rngRandom() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
