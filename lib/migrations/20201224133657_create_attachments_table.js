exports.up = function(knex) {
    return knex.schema
        .createTable('attachments', function (table) {
            table.increments('id');
            table.text('name').notNullable();
            table.float('chance');
        })
        .createTable('attachments_items', function (table) {
            table.integer('attachment_id').unsigned().references('attachments.id');
            table.integer('item_id').unsigned().references('items.id');
            table.float('chance');
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('attachments')
        .dropTable('attachments_items');
};
