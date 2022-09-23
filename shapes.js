class Shape {
  color;
  currentPoints = null; // current position on the board
  direction = 0; // index of points array indicating current shape direction
  offset = [0, 0]; // current offset
  points;

  constructor(color, points) {
    this.color = color;
    this.points = points;
  }

}

const shapeI = new Shape('blue',
  [
    [ // horizontal
      [-3, 0],
      [-2, 0],
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0]
    ],
    [ // vertical
      [-1, -2],
      [0, -2],
      [-1, -1],
      [0, -1],
      [-1, 0],
      [0, 0],
      [-1, 1],
      [0, 1]
    ]
  ]);

const shapeJ = new Shape('yellow',
  [
    [ // horizontal 1
      [-3, 0],
      [-2, 0],
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1]
    ],
    [ // vertical 1
      [-1, -1],
      [0, -1],
      [-1, 0],
      [0, 0],
      [-3, 1],
      [-2, 1],
      [-1, 1],
      [0, 1],
    ],
    [ // horizontal 2
      [-3, -1],
      [-2, -1],
      [-3, 0],
      [-2, 0],
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [ // vertical 2
      [-1, -1],
      [0, -1],
      [1, -1],
      [2, -1],
      [-1, 0],
      [0, 0],
      [-1, 1],
      [0, 1],
    ],
  ]);

const shapeL = new Shape('cyan',
  [
    [ // horizontal 1
      [-3, 0],
      [-2, 0],
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0],
      [-3, 1],
      [-2, 1]
    ],
    [ // vertical 1
      [-3, -1],
      [-2, -1],
      [-1, -1],
      [0, -1],
      [-1, 0],
      [0, 0],
      [-1, 1],
      [0, 1],
    ],
    [ // horizontal 2
      [1, -1],
      [2, -1],
      [-3, 0],
      [-2, 0],
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [ // vertical 2
      [-1, -1],
      [0, -1],
      [-1, 0],
      [0, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [2, 1]
    ],
  ]);

const shapeO = new Shape('magenta',
  [
    [
      [-3, 0],
      [-2, 0],
      [-1, 0],
      [0, 0],
      [-3, 1],
      [-2, 1],
      [-1, 1],
      [0, 1],
    ]
  ]);

const shapeS = new Shape('green',
  [
    [ // horizontal
      [-3, 1],
      [-2, 1],
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0],
      [-1, 1],
      [0, 1]
    ],
    [ // vertical
      [-1, 0],
      [0, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2],
    ],
  ]);

const shapeT = new Shape('white',
  [
    [ // horizontal 1
      [-3, 0],
      [-2, 0],
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0],
      [-1, 1],
      [0, 1]
    ],
    [ // vertical 1
      [-1, -1],
      [0, -1],
      [-3, 0],
      [-2, 0],
      [-1, 0],
      [0, 0],
      [-1, 1],
      [0, 1],
    ],
    [ // horizontal 2
      [-1, -1],
      [0, -1],
      [-3, 0],
      [-2, 0],
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [ // vertical 2
      [-1, -1],
      [0, -1],
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0],
      [-1, 1],
      [0, 1],
    ],
  ]);

const shapeZ = new Shape('red',
  [
    [ // horizontal
      [-3, 0],
      [-2, 0],
      [-1, 0],
      [0, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [ // vertical
      [-3, 0],
      [-2, 0],
      [-3, 1],
      [-2, 1],
      [-1, -1],
      [0, -1],
      [-1, 0],
      [0, 0],
    ],
  ]);

const shapes = Object.freeze([
  shapeI,
  shapeJ,
  shapeL,
  shapeO,
  shapeS,
  shapeT,
  shapeZ,
]);

module.exports = { shapes };
