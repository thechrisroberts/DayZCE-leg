exports.up = function(knex) {
    return knex.schema
        .createTable('spawnables', function (table) {
            table.increments('id');
            table.text('name').notNullable();
            table.float('damage_min');
            table.float('damage_max');
            table.float('subcounter_min');
            table.float('subcounter_max');
            table.boolean('hoarder');
        })
        .createTable('files_spawnables', function (table) {
            table.integer('file_id').unsigned().references('files.id');
            table.integer('spawnable_id').unsigned().references('spawnables.id');
        })
        .createTable('spawnables_tags', function (table) {
            table.integer('spawnable_id').unsigned().references('spawnables.id');
            table.integer('tag_id').unsigned().references('tags.id');
        })
        .createTable('attachments_spawnables', function (table) {
            table.integer('attachment_id').unsigned().references('attachments.id');
            table.integer('spawnable_id').unsigned().references('spawnables.id');
        })
        .createTable('cargo_spawnables', function (table) {
            table.integer('cargo_id').unsigned().references('cargo.id');
            table.integer('spawnable_id').unsigned().references('spawnables.id');
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('spawnables')
        .dropTable('files_spawnables')
        .dropTable('spawnables_tags')
        .dropTable('attachments_spawnables')
        .dropTable('spawnables_cargo');
};
