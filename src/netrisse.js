#!/usr/bin/env node

const MersenneTwister = require('mersenne-twister');
const Screen = require('./screen');
const intro = require('./intro');

// multiplayer game modes:  battle (default), friendly
// need to wait to start the game until all players are ready (2nd board is not null)

const colorEnabled = true;
const screen = new Screen(colorEnabled);

const seed = new MersenneTwister().random_int();
// const seed = 3103172451;

intro(screen, seed);
