const {knex} = require('./database-client');
const {apiGatewayOkResponse, apiGatewayErrorResponse} = require('./api-gateway-responses');

function parseResult(result) {
  if (!result.length) {
    throw {message: 'Order not found', statusCode: 404};
  }

  return {
    statusCode: 200,
    result: result[0].order_doc
  };
}

function getOrder(orderId) {
  return knex('orders')
    .where({id: orderId})
    .select('order_doc');
}

async function getId(event) {
  return event.pathParameters.orderId;
}

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
