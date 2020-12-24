exports.up = function(knex) {
    return knex.schema
        .createTable('items', function (table) {
            table.increments('id');
            table.text('name').notNullable();
            table.integer('nominal');
            table.integer('lifetime');
            table.integer('restock');
            table.integer('min');
            table.integer('quantmin');
            table.integer('quantmax');
            table.integer('cost');
            table.boolean('count_in_cargo');
            table.boolean('count_in_hoarder');
            table.boolean('count_in_map');
            table.boolean('count_in_player');
            table.boolean('crafted');
            table.boolean('deloot');
        })
        .createTable('files_items', function (table) {
            table.integer('file_id').unsigned().references('files.id');
            table.integer('item_id').unsigned().references('items.id');
        })
        .createTable('categories_items', function (table) {
            table.integer('category_id').unsigned().references('categories.id');
            table.integer('item_id').unsigned().references('items.id');
        })
        .createTable('items_tags', function (table) {
            table.integer('item_id').unsigned().references('items.id');
            table.integer('tag_id').unsigned().references('tags.id');
        })
        .createTable('items_usages', function (table) {
            table.integer('item_id').unsigned().references('items.id');
            table.integer('usage_id').unsigned().references('usages.id');
        })
        .createTable('items_values', function (table) {
            table.integer('item_id').unsigned().references('items.id');
            table.integer('value_id').unsigned().references('value.id');
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTable('items')
        .dropTable('files_items')
        .dropTable('categories_items')
        .dropTable('items_tags')
        .dropTable('items_usages')
        .dropTable('items_values');
};
