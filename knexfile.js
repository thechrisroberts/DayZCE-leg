const dbFile = './store/dayzce.sqlite3';

module.exports = {
    client: 'sqlite3',
    connection: {
        filename: dbFile,
    },
    useNullAsDefault: true,
    migrations: {
        directory: 'lib/migrations'
    },    
};
