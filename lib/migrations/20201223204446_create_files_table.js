exports.up = function(knex) {
    return knex.schema
        .createTable('files', function (table) {
            table.increments('id');
            table.text('name').notNullable();
            table.text('path').notNullable();
            table.text('type').notNullable();
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('files');
};
