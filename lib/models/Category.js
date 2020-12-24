'use strict';

const db = require('../db');
const Item = require('./Item');

module.exports = db.bookshelf.model('Category', {
    tableName: 'categories',
    items() {
        return this.belongsToMany('Item')
    },
});