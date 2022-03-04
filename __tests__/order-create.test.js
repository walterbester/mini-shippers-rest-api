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
});

test('Create order with invalid schema throws', async () => {
  const apiGatewayEvent = {
    ...genericApiGatewayEvent,
    body: JSON.stringify(brokenOrder)
  };

  // Ensure the throw expect is asserted
  expect.assertions(1);
  await handler(apiGatewayEvent)
    .catch(error => {
      const parsedError = JSON.parse(error.message);
      expect(parsedError.statusCode).toBe(400);
    });
});

test('Create order with invalid body throws', async () => {
  const apiGatewayEvent = {
    ...genericApiGatewayEvent,
    body: 'This should throw'
  };

  // Ensure the throw expect is asserted
  expect.assertions(1);
  await handler(apiGatewayEvent)
    .catch(error => {
      const parsedError = JSON.parse(error.message);
      expect(parsedError.statusCode).toBe(400);
    });
});
