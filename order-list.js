const {knex} = require('./database-client');
const {apiGatewayOkResponse, apiGatewayErrorResponse} = require('./api-gateway-responses');

function parseResult(result) {
  if (!result.length) {
    throw {message: 'No orders found', statusCode: 404};
  }

  const mappedResult = result.map(order => JSON.parse(order.order_doc));

  return {
    statusCode: 200,
    result: JSON.stringify(mappedResult)
  };
}

function getOrders() {
  return knex('orders')
    .select('order_doc');
}

function handler(event) {
  return getOrders()
    .then(parseResult)
    .then(apiGatewayOkResponse)
    .catch(apiGatewayErrorResponse);
}

module.exports = {
  handler
}
