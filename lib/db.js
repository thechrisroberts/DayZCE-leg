'use strict';

const dbFile = 'store/dayzce.sqlite3';
const fs = require('fs');
const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: dbFile,
    },
    useNullAsDefault: true,
});
const bookshelf = require('bookshelf')(knex);

if (! fs.existsSync(dbFile)) {
    fs.closeSync(fs.openSync(dbFile, 'w'));
}

module.exports = {
    knex,
    bookshelf,
};