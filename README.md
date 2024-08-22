# PactJS Contract Testing Example

An example test framework using Pact-js to validate contract testing between consumer and provider. The original example is from the [repo](https://github.com/mdcruz/pact-js-example) and book [Contract Testing in Action](https://www.manning.com/books/contract-testing-in-action).

### Pact Broker setup

You need a Pact broker, and this example uses the free trial for [Pactflow](https://pactflow.io/try-for-free/).

Create a `.env` file in the fashion of the existing `.env.example` file.

```
PACT_BROKER_TOKEN=***********
PACT_BROKER_BASE_URL=https://yourownorg.pactflow.io
```

### Consumer side

The consumer is any type API client, including web apps.

Run the tests and create the contract / pact /json-file:

```bash
npm run test:consumer 
```

The contract and the broker are all that binds the Consumer and the Provider. 

Therefore we need a way to upload the contract to the broker:

```bash
npm run publish:pact # uploads the contract to the broker
```

### Provider side 

The consumer is any type of API server. As a requirement for contract testing we need to be able to run the provider app locally. Express.js is used in the example.

```bash
npm run start:provider # runs the provider app
```

Run the provider contract tests

```bash
npm run test:provider # Verifies the contract from the consumer
```

