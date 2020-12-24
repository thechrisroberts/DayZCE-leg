'use strict';

const db = require('../db');

module.exports = db.bookshelf.model('Attachment', {
    tableName: 'attachments',
    items() {
        return this.belongsToMany('Item')
    },
});