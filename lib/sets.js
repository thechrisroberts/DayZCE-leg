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
    usages: {},
    tags: {},
    categories: {},
    values: {},
    cargo: {},
    attachments: {},
};

const files = {
    types: {},
    spawnabletypes: {},
    events: {},
};
const items = {};
const spawns = {};

module.exports = {
    meta,
    files,
    items,
    spawns,
};