'use strict';

const db = require('../db');

module.exports = db.bookshelf.model('Spawnable', {
    tableName: 'spawnables',
    attachments() {
        return this.belongsToMany('Attachment');
    },
    cargo() {
        return this.belongsToMany('Cargo', 'cargo_spawnables');
    },
    tags() {
        return this.belongsToMany('Tag')
    },
    files() {
        return this.belongsToMany('File')
    },
});