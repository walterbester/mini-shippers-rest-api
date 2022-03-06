function apiGatewayOkResponse(response) {
  return {
    statusCode: response.statusCode,
    body: response.result
  };
}

function apiGatewayErrorResponse(error) {
  // This is required for API gateway to map the status codes properly
  return {
    statusCode: error.statusCode,
    body: error.message
  };
}

module.exports = {
  apiGatewayOkResponse,
  apiGatewayErrorResponse
}
