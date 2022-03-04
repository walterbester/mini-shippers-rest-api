const path = require('path');

exports.rollbackDatabase = async (databaseConnection) => {
  // This is done in order for the global test setup to pass an existing connection
  let knex;

  if (databaseConnection) {
    knex = databaseConnection;
  } else {
    knex = require('../database-client');
  }

  return knex.migrate.rollback({directory: path.join(__dirname, './migrations')});
}

exports.setupDatabase = async (databaseConnection) => {
  // This is done in order for the global test setup to pass an existing connection
  let knex;

  if (databaseConnection) {
    knex = databaseConnection;
  } else {
    knex = require('../database-client');
  }

  return knex.migrate.latest({directory: path.join(__dirname, './migrations')});
}
