const {handler} = require('../order-get');
const {knex} = require('../database-client');

const testOrder = require('./test-orders/order-get.json');

const genericApiGatewayEvent = {
  resource: '/',
  path: '/',
  httpMethod: 'GET',
  headers: {},
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  pathParameters: 'suppliedByTest',
  body: null,
  isBase64Encoded: false
};

beforeAll(async () => {
  // Load required test data for this test
  await knex('orders').insert({id: testOrder.OrderId, order_doc: testOrder});
})

afterAll(async () => {
  // Clean up test data
  await knex('orders').del();

  // Clean up connection pool
  await knex.destroy();
})

test('Get order with valid order id', async () => {
  const apiGatewayEvent = {
    ...genericApiGatewayEvent,
    pathParameters: {orderId: testOrder.OrderId},
  };

  const result = await handler(apiGatewayEvent);

  expect(JSON.parse(result.body)).toEqual(testOrder);
});

test('Get order with invalid order id returns 404', async () => {
  const apiGatewayEvent = {
    ...genericApiGatewayEvent,
    pathParameters: {orderId: 'CH-9999-GET'},
  }

  const result = await handler(apiGatewayEvent);
  expect(result.statusCode).toBe(404);
});

test('Get order with no order id returns 400', async () => {
  const apiGatewayEvent = {
    ...genericApiGatewayEvent,
    pathParameters: null,
  };

  const result = await handler(apiGatewayEvent);
  expect(result.statusCode).toBe(400);
});
