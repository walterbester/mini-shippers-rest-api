const {handler} = require('../order-create');
const {knex} = require('../database-client');
const order = require('./test-orders/order-create.json');
const brokenOrder = require('./test-orders/order-create-broken.json');

const genericApiGatewayEvent = {
  resource: '/',
  path: '/',
  httpMethod: 'PUT',
  headers: {},
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  pathParameters: null,
  body: 'suppliedByTest',
  isBase64Encoded: false
};

afterAll(async () => {
  // Clean up test data
  await knex('orders').del();

  // Clean up connection pool
  await knex.destroy();
})

test('Create order with valid schema succeeds', async () => {
  const apiGatewayEvent = {
    ...genericApiGatewayEvent,
    body: JSON.stringify(order)
  };

  await handler(apiGatewayEvent);

  const expectedResult = await knex('orders')
    .where({id: order.OrderId})
    .select('order_doc');

  expect(JSON.parse(expectedResult[0].order_doc)).toEqual(order);
}, 1000000);

test('Create order with invalid schema returns 400', async () => {
  const apiGatewayEvent = {
    ...genericApiGatewayEvent,
    body: JSON.stringify(brokenOrder)
  };

  const result = await handler(apiGatewayEvent);
  expect(result.statusCode).toBe(400);
});

test('Create order with invalid body returns 400', async () => {
  const apiGatewayEvent = {
    ...genericApiGatewayEvent,
    body: 'This should return 400'
  };

  const result = await handler(apiGatewayEvent);
  expect(result.statusCode).toBe(400);
});
