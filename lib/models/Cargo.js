'use strict';

const db = require('../db');

module.exports = db.bookshelf.model('Cargo', {
    tableName: 'cargo',
    attachments() {
        return this.belongsToMany('Item')
    },
});