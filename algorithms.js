/* eslint-disable guard-for-in */

const Rando = require('./rando');

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
   * - if the random shape is the same as the last shape, try to get a different shape
   */
  *frustrationFree(seed) {

    const rando = new Rando(seed);

    let lastShape;

    const shapeLastSeen = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };

    while (true) {

      let shape;

      shape = rando.getRandomNumber(shapes.length);

      const oldestShape = getOldestShape(shapeLastSeen);

      // if we have a shape that hasn't been seen in a while, try to get it
      if (oldestShape && oldestShape !== shape) {

        log(`haven't seen shape ${oldestShape} in a while...`);

        // try up to three times to get the old shape
        for (let i = 0; i < 3; i++) {

          shape = rando.getRandomNumber(shapes.length);

          if (shape === oldestShape) {
            break;
          }

        }

      }

      // if shape is same as the last one, try to get a different shape
      if (shape === lastShape) {
        log(`shape ${shape} is the same as the last one.. try to find another`);
        shape = rando.getRandomNumber(shapes.length);
      }

      for (const s in shapeLastSeen) {

        if (parseInt(s) === shape) {
          shapeLastSeen[s] = 0;
        }
        else {
          shapeLastSeen[s] += 1;
        }
      }

      lastShape = shape;

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
  *easy(seed) {

    const rando = new Rando(seed);

    let easyShapes = [];
    let lastShape;

    while (true) {

      if (easyShapes.length === 0) {
        // create a collection of 3x the shapes list
        easyShapes = shapes.concat(shapes, shapes);
        shuffle(easyShapes, rando);
      }

      let shape, shapeIndex;

      // try up to three times to get a different shape than the previous shape
      for (let i = 0; i < 3; i++) {

        shapeIndex = rando.getRandomNumber(easyShapes.length);
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

  /**
   * this algorithm:
   * - creates a collection of 1x each shape (7 total)
   * - distributes the shapes randomly until all 7 are gone, and repeats this cycle forever
   * - if the random shape is the same as the last shape, try up to 3x to get a different shape
   */
  *tooEasy(seed) {

    const rando = new Rando(seed);

    let easyShapes = [];
    let lastShape;

    while (true) {

      if (easyShapes.length === 0) {
        easyShapes = [...shapes];
        shuffle(easyShapes, rando);
      }

      let shape, shapeIndex;

      // try up to three times to get a different shape than the previous shape
      for (let i = 0; i < 3; i++) {

        shapeIndex = rando.getRandomNumber(easyShapes.length);
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
  *random(seed) {

    const rando = new Rando(seed);

    while (true) {
      yield rando.getRandomNumber(shapes.length);
    }

  }
};

function shuffle(arr, rando) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rando.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
