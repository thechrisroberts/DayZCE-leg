exports.up = function(knex) {
    return knex.schema
        .createTable('cargo', function (table) {
            table.increments('id');
            table.text('name').notNullable();
            table.float('chance');
        })
        .createTable('cargo_items', function (table) {
            table.integer('cargo_id').unsigned().references('cargo.id');
            table.integer('item_id').unsigned().references('items.id');
            table.float('chance');
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('cargo')
        .dropTable('cargo_items');
};
