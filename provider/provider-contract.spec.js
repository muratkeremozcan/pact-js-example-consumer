const { Verifier } = require('@pact-foundation/pact')
const { importData, server } = require('./provider')

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
  consumerVersionTags: ['main'] // an array of consumer versions to verify
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
