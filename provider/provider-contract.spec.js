const { Verifier } = require('@pact-foundation/pact')
const { movies } = require('./provider')

// 1) Run the provider service: npm run start:provider
// 2) Setup the provider verifier options
// 3) Write & execute the provider contract test

// 2) Setup the provider verifier options
const options = {
  provider: 'MoviesAPI',
  providerBaseUrl: `http://localhost:3001`,
  pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
  pactBrokerToken: process.env.PACT_BROKER_TOKEN,
  providerVersion: '1.0.0',
  publishVerificationResult: true,
  consumerVersionTags: ['main'], // an array of consumer versions to verify
  // PROVIDER STATES: we can simulate certain states of the api (like an empty or non-empty db)
  // in order to cover different scenarios
  // the state could have many more variables; it is a good practice to represent it as an object
  // note that the consumer state name should match the provider side
  //
  // * The purpose of the stateHandlers is to ensure that the provider is in the correct state
  // to fulfill the consumer's expectations as defined in the contract tests.
  // * In a real-world scenario, you would typically set up this state by interacting with your service's database
  // * or through an API provided by the service itself (locally).
  // * This ensures that the provider test runs in a controlled environment where all the necessary data
  // and conditions are met, allowing for accurate verification of the consumer's expectations.
  stateHandlers: {
    'Has a movie with a specific ID': (state) => {
      movies.getFirstMovie().id = state.id
      return Promise.resolve({
        description: `Movie with ID ${state.id} added!`
      })
    }
  }
}
const verifier = new Verifier(options)

describe('Pact Verification', () => {
  test('should validate the expectations of movie-consumer', () => {
    // 3) Write & execute the provider contract test (you have to return)
    return verifier.verifyProvider().then((output) => {
      console.log('Pact Verification Complete!')
      console.log('Result:', output)
    })
  })
})
