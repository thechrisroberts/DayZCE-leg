exports.up = function(knex) {
    return knex.schema
        .createTable('values', function (table) {
            table.increments('id');
            table.text('name').notNullable();
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('values');
};
