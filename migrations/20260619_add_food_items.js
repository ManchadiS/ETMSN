exports.up = function(knex) {
  return knex.schema.createTable('food_items', function(table) {
    table.increments('id').primary();
    table.string('uuid').notNullable().unique();
    table.string('name').notNullable();
    table.decimal('price', 14, 2).notNullable();
    table.string('description');
    table.string('category');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('food_items');
};
