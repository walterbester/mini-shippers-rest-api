const {knex} = require('./database-client');
const {setupDatabase, rollbackDatabase} = require('./db/index');
const {apiGatewayOkResponse, apiGatewayErrorResponse} = require('./api-gateway-responses');

function setup() {
  return setupDatabase()
    .then(() => apiGatewayOkResponse({
      statusCode: 200,
      result: 'Database setup completed'
    }))
    .catch(apiGatewayErrorResponse);
}

function rollback() {
  return rollbackDatabase()
    .then(() => apiGatewayOkResponse({
      statusCode: 200,
      result: 'Database setup rolled back'
    }))
    .catch(apiGatewayErrorResponse);
}

module.exports = {
  setup,
  rollback
}
