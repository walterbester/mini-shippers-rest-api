const {handler} = require('../order-list');
const {knex} = require('../database-client');

const order1 = require('./test-orders/order-list-1.json');
const order2 = require('./test-orders/order-list-2.json');

const apiGatewayEvent = {
  resource: '/',
  path: '/',
  httpMethod: 'GET',
  headers: {},
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  pathParameters: null,
  body: null,
  isBase64Encoded: false
};

beforeAll(async () => {
  // Load required test data for this test
  await knex('orders').insert({id: order1.OrderId, order_doc: order1});
  await knex('orders').insert({id: order2.OrderId, order_doc: order2});
})

afterAll(async () => {
  // Clean up test data
  await knex('orders').del();

  // Clean up connection pool
  await knex.destroy();
})

test('Get available orders', async () => {
  const result = await handler(apiGatewayEvent);

  const expectedResult = [
    order1,
    order2
  ];

  expect(result.length).toBe(2);
  expect(result).toEqual(expectedResult);
});

test('No available orders throws', async () => {
  await knex('orders').del();

  // Ensure the throw expect is asserted
  expect.assertions(1);
  await handler(apiGatewayEvent)
    .catch(error => {
      const parsedError = JSON.parse(error.message);
      expect(parsedError.statusCode).toBe(404);
    });
});
