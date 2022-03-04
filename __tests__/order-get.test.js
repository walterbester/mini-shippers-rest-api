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
    pathParameters: {id: testOrder.OrderId},
  };

  const result = await handler(apiGatewayEvent);

  expect(JSON.parse(result.order_doc)).toEqual(testOrder);
});

test('Get order with invalid order id', async () => {
  const apiGatewayEvent = {
    ...genericApiGatewayEvent,
    pathParameters: {id: 'CH-9999-GET'},
  }

  // Ensure the throw expect is asserted
  expect.assertions(1);

  await handler(apiGatewayEvent)
    .catch(error => {
      const parsedError = JSON.parse(error.message);
      expect(parsedError.statusCode).toBe(404);
    });
});
