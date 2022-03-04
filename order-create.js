const {knex} = require('./database-client');
const Ajv = require("ajv");
const orderSchemaDefinition = require('./order-schema.json');
const ajv = new Ajv({allErrors: true});
const orderSchemaValidator = ajv.compile(orderSchemaDefinition);

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

    throw new Error(JSON.stringify({message: `Order not valid: ${errorMessage}`, statusCode: 400}));
  }

  return order;
}

async function parseEvent(event) {
  try{
    return JSON.parse(event.body);
  } catch (error) {
    throw new Error(JSON.stringify({message: 'Unable to parse request', statusCode: 400}));
  }
}

async function handler(event) {
  return parseEvent(event)
    .then(validateOrder)
    .then(createOrder);
}

module.exports = {
  handler
}
