'use strict';

const config = require('./config');
const loadCE = require('./load/loadCE');
const loadTrader = require('./load/loadTrader');

// console.log('Loading CE files');

// loadCE.gatherCE();

// console.log('Assembling types');

// loadCE.loadTypes();

// console.log('Assembling spawnable');

// loadCE.loadSpawnable();

console.log('Assembling trader items');

loadTrader.loadItems();