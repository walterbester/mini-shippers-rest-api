const {knex} = require('../database-client');
const {rollbackDatabase, setupDatabase} = require('../db/index');
const AWS = require('aws-sdk');

process.env.AWS_REGION = 'us-east-1';
process.env.SECRETS_MANAGER_ENDPOINT = 'http://localhost:4566';
process.env.DATABASE_SECRET_NAME = 'database_credentials';

async function createSecret(secretName, secret) {
  const secretsManager = new AWS.SecretsManager({
    endpoint: process.env.SECRETS_MANAGER_ENDPOINT
  });

  // If the secret already exists, delete it so it can be recreated
  await secretsManager
    .deleteSecret({
      ForceDeleteWithoutRecovery: true,
      SecretId: secretName
    })
    .promise()
    .catch(error => {
      if (error.code !== 'ResourceNotFoundException') {
        throw error;
      }
    });

  return secretsManager
    .createSecret({
      Name: secretName,
      SecretString: JSON.stringify(secret)
    })
    .promise();
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

  // Ensure database is clean
  await rollbackDatabase();

  // Set up database with latest migrations
  await setupDatabase();

  // Clean up connection pool
  await knex.destroy();
}
