'use strict';

const config = require('./config');
global.config = config;

const db = require('./lib/db');
const loadCE = require('./lib/load/loadCE');
const loadTrader = require('./lib/load/loadTrader');

console.log('Loading CE files');

loadCE.gatherCE();

// console.log('Assembling types');

// loadCE.loadTypes();

// console.log('Assembling spawnable');

// loadCE.loadSpawnable();

// console.log('Assembling trader items');

// loadTrader.loadItems();
