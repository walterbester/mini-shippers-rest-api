const {knex} = require('./database-client');

function getOrder(orderId) {
  return knex('orders')
    .where({id: orderId})
    .select('order_doc');
}

function getId(event) {
  return event.pathParameters.id;
}

async function handler(event) {
  const orderId = getId(event);

  const order = await getOrder(orderId)
    .then(res => res[0]);
  
  if (!order) {
    throw new Error(JSON.stringify({message: 'Order not found', statusCode: 404}));
  }

  return order;
}

module.exports = {
  handler
}
