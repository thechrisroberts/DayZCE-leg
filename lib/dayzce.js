'use strict';

const config = require('./config');
global.config = config;

const fs = require('fs');
const db = require('./db.js');
const knexConfig = require('../knexfile');
const loadCE = require('./load/loadCE');
const loadMeta = require('./load/loadMeta');
const loadTrader = require('./load/loadTrader');

module.exports = {
    async testStart() {
        // TODO: FOR INITIAL
        if (fs.existsSync('./store/dayzce.sqlite3')) {
            fs.unlinkSync('./store/dayzce.sqlite3');
        }
        
        await db.knex.migrate.latest(knexConfig);
        // END INITIAL
    },
    async run() {
        await this.testStart();

        console.log('Loading CE meta');

        await loadMeta.load();

        console.log('Loading CE files');

        await loadCE.gatherCE();

        // console.log('Assembling types');

        // loadCE.loadTypes();

        // console.log('Assembling spawnable');

        // loadCE.loadSpawnable();

        // console.log('Assembling trader items');

        // loadTrader.loadItems();

        db.knex.destroy();
    },
    async load() {},
};
