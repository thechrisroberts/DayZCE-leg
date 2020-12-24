'use strict';

const db = require('../db');
const File = require('./File');
const Category = require('./Category');
const Tag = require('./Tag');
const Usage = require('./Usage');
const Value = require('./Value');

module.exports = db.bookshelf.model('Item', {
    tableName: 'items',
    files() {
        return this.belongsToMany('File');
    },
    categories() {
        return this.belongsToMany('Category');
    },
    tags() {
        return this.belongsToMany('Tag');
    },
    usages() {
        return this.belongsToMany('Usage');
    },
    values() {
        return this.belongsToMany('Value');
    },
});