## Chosen architecture

I chose to use Node.js for this project in conjunction with the following AWS services:
* RDS MySQL
* API Gateway
* Lambda
* Secrets Manager

The API calls are authorized using a Lambda authorizer which can be expanded into a proper authentication service as it is only doing dummy authentication at this stage.

Local testing is done using Jest in conjunction with Docker running two containers, MySQL for the database and localstack for a local secrets manager.

The deployment is done using the AWS SAM CLI, most of the deployment is done using the serverless framework.

Services created by hand using the AWS Console:
* RDS (using the default VPC)
* The database secret in Secrets Manager
* An endpoint for the VPC to connect to Secrets Manager using the AWS private endpoint

All the steps are outlined in the initial [README](../README.md)

---
Go back to [readme](../README.md)