'use strict';

const db = require('../db');
const File = require('./File');

module.exports = db.bookshelf.model('Item', {
    tableName: 'Items',
    files() {
        return this.hasMany('File')
    },
});