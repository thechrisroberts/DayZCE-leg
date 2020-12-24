'use strict';

const db = require('../db');
const Item = require('./Item');

module.exports = db.bookshelf.model('File', {
    tableName: 'files',
    items() {
        return this.hasMany('Item')
    },
});