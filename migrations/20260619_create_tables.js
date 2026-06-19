exports.up = function(knex) {
  return knex.schema
    .createTable('restaurants', function(table) {
      table.increments('id').primary();
      table.string('uuid').notNullable().unique();
      table.string('name').notNullable();
      table.string('address');
      table.timestamps(true, true);
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('restaurants');
};
