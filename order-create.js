const {knex} = require('./database-client');
const {apiGatewayOkResponse, apiGatewayErrorResponse} = require('./api-gateway-responses');
const Ajv = require("ajv");
const orderSchemaDefinition = require('./order-schema.json');
const ajv = new Ajv({allErrors: true});
const orderSchemaValidator = ajv.compile(orderSchemaDefinition);

function parseResult(result) {
  return {
    statusCode: 201,
    result: 'Order successfully created'
  };
}

function createOrder(order) {
  return knex('orders')
    .insert({
      id: order.OrderId,
      order_doc: order
    });
}

async function validateOrder(order) {
  const isValid = orderSchemaValidator(order);

  if (!isValid) {
    let errorMessage = '';

    orderSchemaValidator.errors.some(error => {
      if (errorMessage) {
        errorMessage += ', ';
      }

      errorMessage += ajv.errorsText([error]);
    });

    throw {message: `Order not valid: ${errorMessage}`, statusCode: 400};
  }

  return order;
}

async function parseEvent(event) {
  try{
    return JSON.parse(event.body);
  } catch (error) {
    throw {message: 'Unable to parse request', statusCode: 400};
  }
}

async function handler(event) {
  return parseEvent(event)
    .then(validateOrder)
    .then(createOrder)
    .then(parseResult)
    .then(apiGatewayOkResponse)
    .catch(apiGatewayErrorResponse);
}

module.exports = {
  handler
}
