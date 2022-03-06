const {knex} = require('./database-client');
const {apiGatewayOkResponse, apiGatewayErrorResponse} = require('./api-gateway-responses');

/**
 * Parse the result into an API Gateway friendly format
 *
 * @property {Array} result - Database result with a specific order
 * @returns {Object} - Status code and api result
 */
function parseResult(result) {
  if (!result.length) {
    throw {message: 'Order not found', statusCode: 404};
  }

  return {
    statusCode: 200,
    result: result[0].order_doc
  };
}

/**
 * Connect to the database get an order
 *
 * @param {String} orderId - OrderId to be fetched
 * @returns {Array} - Database result with the specific order
 */
function getOrder(orderId) {
  return knex('orders')
    .where({id: orderId})
    .select('order_doc');
}

/**
 * Parse the event to get the order id that needs to be fetched
 *
 * @param {Object} event - API Gateway event
 * @returns {String} - Order id that needs to be fetched
 */
async function getId(event) {
  const orderId = event.pathParameters && event.pathParameters.orderId;

  if(!orderId) {
    throw {message: 'No order id provided', statusCode: 400};
  }

  return orderId;
}

/**
 *
 * @param {Object} event - API Gateway event
 * @returns {Object} - API Gateway friendly response with body and status code
 */
 async function handler(event) {
  return getId(event)
    .then(getOrder)
    .then(parseResult)
    .then(apiGatewayOkResponse)
    .catch(apiGatewayErrorResponse);
}

module.exports = {
  handler
}
