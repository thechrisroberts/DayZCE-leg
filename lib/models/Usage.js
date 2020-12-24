'use strict';

const db = require('../db');
const Item = require('./Item');

module.exports = db.bookshelf.model('Usage', {
    tableName: 'usages',
    items() {
        return this.belongsToMany('Item')
    },
});