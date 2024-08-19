const path = require('path')
const { fetchMovies } = require('./consumer')
const { PactV3, MatchersV3 } = require('@pact-foundation/pact')

// 1) Setup the mock provider for the consumer
// 2) Register the consumer's expectations against the (mock) provider
// 3) Call the consumer against the mock provider
// 4) Verify the consumer test and generate the contract

// 1) Setup the mock provider for the consumer
const provider = new PactV3({
  dir: path.resolve(process.cwd(), 'pacts'),
  consumer: 'WebConsumer',
  provider: 'MoviesAPI'
})

// loose matching: the consumer should care more about the shape of the data
const EXPECTED_BODY = { id: 1, name: 'My movie', year: 1999 }

describe('Movies API', () => {
  describe('When a GET request is made to /movies', () => {
    test('it should return all movies', async () => {
      // 2) Register the consumer's expectations against the (mock) provider
      provider
        .uponReceiving('a request to get all movies')
        .withRequest({
          method: 'GET',
          path: '/movies'
        })
        .willRespondWith({
          status: 200,
          body: MatchersV3.eachLike(EXPECTED_BODY)
        })

      // 3) Call the consumer against the mock provider
      await provider.executeTest(async (mockProvider) => {
        const movies = await fetchMovies(mockProvider.url)
        // 4) Verify the consumer test and generate the contract
        expect(movies[0]).toEqual(EXPECTED_BODY)
      })
    })
  })
})
