const {rollbackDatabase, setupDatabase} = require('../db/index');
const AWS = require('aws-sdk');

process.env.AWS_REGION = 'ap-southeast-2';
process.env.SECRETS_MANAGER_ENDPOINT = 'http://localhost:4566';
process.env.DATABASE_SECRET_NAME = 'database_credentials';

function createSecret(secretName, secret) {
  const secretsManager = new AWS.SecretsManager({
    region: process.env.AWS_REGION
  });

  return secretsManager.createSecret({
    Name: secretName,
    SecretString: JSON.stringify(secret)
  });
}

module.exports = async () => {
  const databaseSecret = {
    host : 'localhost',
    port : 3306,
    user : 'root',
    password : 'w00t',
    database : 'shippers_test'
  };

  // Create database secret in secrets manager
  await createSecret(process.env.DATABASE_SECRET_NAME, databaseSecret);

  // Create global database connection to set up the database
  const databaseConnection = await require('knex')({
    client: 'mysql',
    connection: databaseSecret
  });

  // Ensure database is clean
  await rollbackDatabase(databaseConnection);

  // Set up database with latest migrations
  await setupDatabase(databaseConnection);

  // Clean up connection pool
  await databaseConnection.destroy();
}
