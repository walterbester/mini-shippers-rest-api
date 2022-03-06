# Mini Shippers REST API

## Chosen architecture

The chosen architecture is documented [here](./docs/architecture.md)

---

# Setup and run local unit tests

Ensure the following is installed to run the tests locally:

* [Node and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (Node 14 was used for this project)
* [Docker](https://www.docker.com/products/docker-desktop)

Once satisfied with the installations, the project needs to be cloned and all dependencies installed with `npm install` on a new terminal.

Once successfully installed, docker images need to be started to enable the tests to run. Using a terminal, run:

    cd docker
    docker-compose up -d

Give that a minute to pull down images if required and once it appears to be started, give in another minute to ensure it is fully running.

The tests can then be run with the command `npm test` on the terminal. The tests will run, showing the status and the test coverage.

---

# Setup and run in a development environment

Deploying this project to a development environment uses the AWS Serverless Application Model, the following needs to be installed and configured (if you have some of these installed / configured then the specific step can be skipped, set up only what is still required):

* Install [AWS CLI](https://aws.amazon.com/cli/).
* Create / sign in with an [AWS account](https://aws.amazon.com/).
* [Configure IAM user and user group](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html) required by the AWS CLI to allow deployment from your local. Admin permissions will work and can be used initially, but permissions can be tweaked if required.
* [Set up AWS credentials](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started-set-up-credentials.html) in the AWS CLI. This is to configure AWS SAM CLI to allow it to deploy to AWS on your behalf.
* Install [AWS SAM CLI](https://aws.amazon.com/serverless/sam/) - *If you happen to use Windows with a bash terminal, the `sam` command might not resolve, use `sam.cmd` instead.*
* Using the [AWS Console](https://console.aws.amazon.com/console), create an **RDS MySQL** database (skip this if you already have a database that is usable).
  * Ensure that you specify a default database name, for this project the name `shippers_test` was used.
  * Keep note of the credentials as they will be required in the next step.
* Using the [AWS Console](https://console.aws.amazon.com/console), create a secret using Secrets Manager with the configuration:
  * Other type of secret.
  * Plaintext, replacing the required attributes as described:
  ```
  {
    "port":3306,
    "host":"RDS Endpoint of new / existing database",
    "user":"Admin user, or user with permission to create tables",
    "password":"password",
    "database":"RDS database name"
  }
  ```
  * Set the secret name to `database_credentials`.
* Take note of the secret ARN, in the `template.yaml` file in the project, at the top there is a parameter called DatabaseSecretArnParameter. Replace the default value with the secret ARN that was generated in the previous step.
* In the [AWS Console](https://console.aws.amazon.com/console) navigate to VPC.
  * If you created a new RDS instance and had no VPC, a default VPC would have been created for you, otherwise navigate to the VPC that your RDS instance was created in.
  * Navigate to the security group that belongs to your VPC and take note of the `Security group ID`, add this id to the `template.yaml` file in the project under `Globals: -> Function: -> VpcConfig: -> SecurityGroupIds` which is towards the top of the file.
  * Navigate to the subnets that belong to your security group and take note of the `Subnet ID`, there will be more than one so add each of these ids to the `template.yaml` file in the project under `Globals: -> Function: -> VpcConfig: -> SubnetIds` which is towards the top of the file.
* This project uses AWS Secrets Manager, so you need to ensure that your VPC has access to it:
  * Navigate to **VPC** in the AWS Console.
  * In the navigation pane, choose **Endpoints**.
  * In the main pane, choose **Create Endpoint**.
  * Add a descriptive name such as `secrets-manager-endpoint`.
  * For **Service category**, choose **AWS services**.
  * In the **Service Name** list, choose the entry for the Secrets Manager interface endpoint in the region. For example, in the US East (N.Virginia) Region, the entry name is *com.amazonaws.us-east-1.secretsmanager*.
  * For **VPC**, choose your VPC that your RDS instance belongs to.
  * For **Subnets**, choose a subnet from each Availability Zone to include.
  * For **Security group**, select your security group that belongs to your VPC.
  * Choose **Create endpoint**.
  * Ensure that *enableDnsHostnames* and *enableDnsSupport* is enabled in your VPC, in order for the VPC to navigate to Secrets Manager using the private endpoints.

The setup for the deployment is now complete, so we can package and deploy the solution.
* In a terminal, run `sam build`.
  * *If you happen to use Windows with a bash terminal, the `sam` command might not resolve, use `sam.cmd` instead.*
* In a terminal, run `sam deploy --guided` and follow the prompts to deploy.

---

# Hit the deployed APIs using Postman

Now we get to test the APIs that has been deployed, while at the same time completing the database setup.

Once the deployment with `sam deploy` completes, it will provide an outputs section, in this section is a key called WebEndpoint, and a value with the API Gateway endpoint for the deployed API.

To hit the endpoints:
* Open [Postman](https://www.postman.com/).
* Create a new HTTP request.
* Paste the endpoint provided by the deployment into the request URL space provided.
* Under the **Headers** tab, add a key `Authorization` with a value `allow`, this will let the dummy authorization service create a policy that allows Lambda execution.
* **Complete the setup of the database** by sending a POST request to the endpoint you were provided with `db/setup` at the end. This will create the tables required for this project.
* At this point the database is empty so the create endpoint needs to be hit with a valid order so that it can be created. Thereafter the list and get endpoints will return some data.

There is Swagger documentation in this project [documenting the APIs](./swagger.yml), you can download an extension in VS Code called Swagger Preview to have a friendly view of the definition.
