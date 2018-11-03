
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.increments('user_id').primary();
    table.string('username',128).notNullable().unique();
    table.string('password',128).notNullable()
    table.string('email',128).notNullable()
    table.string('role')
    table.bool('status')
  }).createTable('conversation', function(table) {
    table.increments('c_id').primary();
    table.string('user_one').notNullable().references('user_id').inTable('users');
    table.string('user_two').notNullable().references('user_id').inTable('users');
    table.integer('ip').notNullable()
  }).createTable('conversation_reply', function(table) {
    table.increments('cr_id').primary();
    table.string('c_id_fk').references('c_id').inTable('conversation');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('reply').notNullable()
    table.string('user_id_fk').references('user_id').inTable('users');
    table.integer('ip')
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users')
    .dropTable('conversation')
    .dropTable('conversation_reply');
};
