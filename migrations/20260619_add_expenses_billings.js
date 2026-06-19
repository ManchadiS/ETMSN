exports.up = function(knex) {
  return knex.schema
    .createTable('expenses', function(table) {
      table.increments('id').primary();
      table.string('uuid').notNullable().unique();
      table.decimal('amount', 14, 2).notNullable();
      table.string('description');
      table.date('date');
      table.string('category');
      table.timestamps(true, true);
    })
    .createTable('billings', function(table) {
      table.increments('id').primary();
      table.string('uuid').notNullable().unique();
      table.decimal('amount', 14, 2).notNullable();
      table.integer('restaurant_id').unsigned().references('id').inTable('restaurants').onDelete('SET NULL');
      table.date('date');
      table.string('description');
      table.string('status');
      table.string('mobile');
      table.string('email_id');
      table.decimal('cgst', 14, 2).defaultTo(0);
      table.decimal('sgst', 14, 2).defaultTo(0);
      table.json('food_items').nullable();
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('billings')
    .dropTableIfExists('expenses');
};
