exports.up = function(knex) {
    return knex.schema
        .createTable('categories', function (table) {
            table.increments('id');
            table.text('name').notNullable();
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('categories');
};
