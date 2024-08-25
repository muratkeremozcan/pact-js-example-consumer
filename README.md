# PactJS Contract Testing Example

An example test framework using Pact-js to validate contract testing between consumer and provider. The application that we are testing is a simple movies API that returns a list of movies.

## Running the Movies API Locally

```bash
npm i
```

Run the Movies API, and play around with the test.http file (VScode Rest Client extension) to get familiar with the provider API.

```bash
npm run start:provider
```

> The provider API has to be running locally for the provider tests to be executed.

## Running the Tests

We are using [Pactflow](https://pactflow.io/) as our broker. To use Pactflow, register for their free developer plan and use the sample `.env.example` file to create a `.env` file of your own

```bash
# create a free pact broker at 
# https://pactflow.io/try-for-free/
PACT_BROKER_TOKEN=***********
PACT_BROKER_BASE_URL=https://yourownorg.pactflow.io
```

### Consumer Tests

Run the consumer tests:

```bash
npm run test:consumer
```

Publish the contract to your Pact Broker:

```bash
npm run publish:pact
```

The consumer 

### Provider Tests

1. **Start the provider service:**

   ```bash
   npm run start:provider
   ```

2. **Run the provider tests:**

   ```bash
   npm run test:provider
   ```

### Advanced CI/CD Integration

To fully benefit from contract testing, we've set up scripts that integrate into a CI/CD pipeline, ensuring continuous verification and deployment of contracts.

#### Can I Deploy?

Before deploying to an environment, you can verify if the consumer and provider versions are compatible with the `can-i-deploy` tool.

- **Verify the provider:**

  ```bash
  npm run can:i:deploy:provider
  ```

- **Verify the consumer:**

  ```bash
  npm run can:i:deploy:consumer
  ```

#### Record Deployments

It's crucial to record the deployments in the Pact Broker to maintain an accurate history of which versions are deployed in each environment.

- **Record the provider deployment:**

  ```bash
  npm run record:provider:deployment
  ```

- **Record the consumer deployment:**

  ```bash
  npm run record:consumer:deployment
  ```

These scripts are designed to only record deployments when on the `main` branch, ensuring that only final production-ready versions are tracked.

### Environment Setup Script

To streamline our scripts, we've centralized the setup of environment variables in a script:

```bash
./scripts/env-setup.sh
```

This script initializes critical environment variables like `GITHUB_SHA` and `GITHUB_BRANCH`, which are used across multiple scripts to ensure consistency.
