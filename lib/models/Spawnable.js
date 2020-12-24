'use strict';

const db = require('../db');

module.exports = db.bookshelf.model('Spawnable', {
    tableName: 'spawnables',
    attachments() {
        return this.belongsToMany('Item', 'items_spawnables_attachments')
    },
    cargo() {
        return this.belongsToMany('Item', 'items_spawnables_cargo')
    },
    tags() {
        return this.belongsToMany('Tag')
    },
    files() {
        return this.belongsToMany('File')
    },
});