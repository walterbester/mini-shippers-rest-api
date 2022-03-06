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

  expect(JSON.parse(result.body).length).toBe(2);
  expect(JSON.parse(result.body)).toEqual(expectedResult);
});

test('No available orders returns 404', async () => {
  await knex('orders').del();

  // Ensure the throw expect is asserted
  expect.assertions(1);
  const result = await handler(apiGatewayEvent);
  expect(result.statusCode).toBe(404);
});
