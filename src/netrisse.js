#!/usr/bin/env node

const MersenneTwister = require('mersenne-twister');
const Screen = require('./screen');
const intro = require('./intro');

// multiplayer game modes:  battle (default), friendly
// need to wait to start the game until all players are ready (2nd board is not null)

// need to deal with concurrency issues -- what if p1 paused the game, p2 does a hold (or move), successful on p2 screen but not p1 screen because game paused
// probably change the logic to always allow the movement if it was not the main board

const colorEnabled = true;
const screen = new Screen(colorEnabled);

const seed = new MersenneTwister().random_int();
// const seed = 3103172451;

intro(screen, seed);
