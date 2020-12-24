'use strict';

const db = require('./db');
const File = require('./models/File');
const Item = require('./models/Item');
const Spawnable = require('./models/Spawnable');
const Usage = require('./models/Usage');
const Tag = require('./models/Tag');
const Category = require('./models/Category');
const Value = require('./models/Value');

const meta = {
    usages: {},
    tags: {},
    categories: {},
    values: {},
};

const files = new db.bookshelf.Collection('File', { model: File });
const items = new db.bookshelf.Collection('Item', { model: Item });
const spawns = new db.bookshelf.Collection('Spawnable', { model: Spawnable });

module.exports = {
    meta,
    files,
    items,
    spawns,
};