const {knex} = require('./database-client');
const {apiGatewayOkResponse, apiGatewayErrorResponse} = require('./api-gateway-responses');

/**
 * Parse the result into an API Gateway friendly format
 *
 * @property {Array} result - Database results with all available orders
 * @returns {Object} - Status code and api result
 */
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

/**
 * Connect to the database get all available orders
 *
 * @returns {Array} - Database result with all available orders
 */
function getOrders() {
  return knex('orders')
    .select('order_doc');
}

/**
 *
 * @param {Object} event - API Gateway event
 * @returns {Object} - API Gateway friendly response with body and status code
 */
function handler(event) {
  return getOrders()
    .then(parseResult)
    .then(apiGatewayOkResponse)
    .catch(apiGatewayErrorResponse);
}

module.exports = {
  handler
}
