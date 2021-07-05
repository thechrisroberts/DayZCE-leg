'use strict';

const db = require('../db');

module.exports = db.bookshelf.model('Cargo', {
    tableName: 'cargo',
    items() {
        return this.belongsToMany('Item')
    },
});