'use strict';

const db = require('../db');
const Item = require('./Item');

module.exports = db.bookshelf.model('Tag', {
    tableName: 'tags',
    items() {
        return this.belongsToMany('Item')
    },
});