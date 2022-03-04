const {knex} = require('./database-client');

function parseResult(result) {
  if (!result.length) {
    throw new Error(JSON.stringify({message: 'Orders not found', statusCode: 404}));
  }

  return result.map(order => JSON.parse(order.order_doc));
}

function getOrders() {
  return knex('orders')
    .select('order_doc');
}

function handler(event) {
  return getOrders()
    .then(parseResult);
}

module.exports = {
  handler
}
