const AWS = require('aws-sdk');
const knex = getConnection();

async function getConnectionConfig() {
  const secretsManager = new AWS.SecretsManager({
    endpoint: process.env.SECRETS_MANAGER_ENDPOINT
  });

  const config = secretsManager.getSecretValue({
    SecretId: process.env.DATABASE_SECRET_NAME
  })
  .promise()
  .then(data => JSON.parse(data.SecretString));

  return config;
}

function getConnection() {
  return require('knex')({
    client: 'mysql',
    connection: getConnectionConfig
  });
}

module.exports = {
  knex,
  getConnection
}
