// Help function to generate an IAM policy
function generatePolicy(principalId, effect, resource) {
  const authResponse = {};

  authResponse.principalId = principalId;

  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
    description: 'Fake authorizer for testing purposes'
  };

  return authResponse;
}

// A simple token-based authorizer example to demonstrate how to use an authorization token
// to allow or deny a request. In this example, the caller named 'user' is allowed to invoke
// a request if the client-supplied token value is 'allow'. The caller is not allowed to invoke
// the request if the token value is 'deny'. If the token value is 'unauthorized' or an empty
// string, the authorizer function returns an HTTP 401 status code. For any other token value,
// the authorizer returns an HTTP 500 status code.
// Note that token values are case-sensitive.
async function handler(event) {
  const token = event.authorizationToken;

  switch (token) {
    case 'allow':
        return generatePolicy('user', 'Allow', event.methodArn);
    case 'deny':
      return generatePolicy('user', 'Deny', event.methodArn);
    case 'unauthorized':
      throw new Error("Unauthorized");   // Return a 401 Unauthorized response
    default:
      throw new Error("Error: Invalid token"); // Return a 500 Invalid token response
  }
};

module.exports = {
  handler
}
