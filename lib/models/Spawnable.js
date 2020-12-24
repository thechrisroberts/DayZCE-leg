'use strict';

const db = require('../db');
const File = require('./File');

module.exports = db.bookshelf.model('Spawnable', {
    tableName: 'spawnables',
    files() {
        return this.hasMany('File')
    },
});