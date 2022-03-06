const {knex} = require('./database-client');
const {apiGatewayOkResponse, apiGatewayErrorResponse} = require('./api-gateway-responses');
const Ajv = require("ajv");
const orderSchemaDefinition = require('./order-schema.json');
const ajv = new Ajv({allErrors: true});
const orderSchemaValidator = ajv.compile(orderSchemaDefinition);

/**
 * Parse the result into an API Gateway friendly format
 *
 * @returns {Object} - Status code and api result
 */
function parseResult() {
  return {
    statusCode: 201,
    result: 'Order successfully created'
  };
}

/**
 * Connect to the database and create an order
 *
 * @param {Object} order - Order to be created
 * @returns {Array} - Database result for the insert
 */
function createOrder(order) {
  return knex('orders')
    .insert({
      id: order.OrderId,
      order_doc: order
    });
}

/**
 * Validate the order with a JSON schema validator
 *
 * @param {Object} order - The order that needs validation
 * @returns {Object} - The validated order
 */
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

/**
 * Parse the event to get the order that needs to be created
 *
 * @param {Object} event - API Gateway event
 * @returns {Object} - Order to be created
 */
async function parseEvent(event) {
  try{
    return JSON.parse(event.body);
  } catch (error) {
    throw {message: 'Unable to parse request', statusCode: 400};
  }
}

/**
 *
 * @param {Object} event - API Gateway event
 * @returns {Object} - API Gateway friendly response with body and status code
 */
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
