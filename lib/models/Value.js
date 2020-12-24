'use strict';

const db = require('../db');
const Item = require('./Item');

module.exports = db.bookshelf.model('Value', {
    tableName: 'values',
    items() {
        return this.belongsToMany('Item')
    },
});