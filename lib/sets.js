'use strict';

const db = require('./db');
const File = require('./models/File');
const Item = require('./models/Item');
const Spawnable = require('./models/Spawnable');
const Usage = require('./models/Usage');
const Tag = require('./models/Tag');
const Category = require('./models/Category');
const Value = require('./models/Value');
const Cargo = require('./models/Cargo');
const Attachment = require('./models/Attachment');

const meta = {
    usages: new db.bookshelf.Collection('Usage', { model: Usage }),
    tags: new db.bookshelf.Collection('Tag', { model: Tag }),
    categories: new db.bookshelf.Collection('Category', { model: Category }),
    values: new db.bookshelf.Collection('Value', { model: Value }),
    cargo: new db.bookshelf.Collection('Cargo', { model: Cargo }),
    attachments: new db.bookshelf.Collection('Attachment', { model: Attachment }),
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