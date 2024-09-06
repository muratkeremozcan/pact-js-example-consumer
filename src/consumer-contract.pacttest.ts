import path from 'path'
import type { ErrorResponse, Movie, SuccessResponse } from './consumer'
import {
  fetchMovies,
  fetchSingleMovie,
  addNewMovie,
  deleteMovie
} from './consumer'
import { PactV3, MatchersV3 } from '@pact-foundation/pact'
import type { V3MockServer } from '@pact-foundation/pact'
import { createProviderState } from './test-helpers/helpers'

// full list of matchers:
// https://docs.pact.io/implementation_guides/javascript/docs/matching#v3-matching-rules
const { eachLike, integer, string } = MatchersV3

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

describe('Movies API', () => {
  describe('When a GET request is made to /movies', () => {
    it('should return all movies', async () => {
      // loose matching: the consumer should care more about the shape of the data
      const EXPECTED_BODY = {
        id: 1,
        name: 'My movie',
        year: 1999
      }

      // 2) Register the consumer's expectations against the (mock) provider
      provider
        .uponReceiving('a request to get all movies')
        .withRequest({
          method: 'GET',
          path: '/movies'
        })
        .willRespondWith({
          status: 200,
          body: eachLike(EXPECTED_BODY)
        })

      // 3) Call the consumer against the mock provider
      await provider.executeTest(async (mockServer: V3MockServer) => {
        const res = (await fetchMovies(mockServer.url)) as Movie[]
        // 4) Verify the consumer test and generate the contract
        expect(res[0]).toEqual(EXPECTED_BODY)
      })
    })
  })

  // PROVIDER STATES: we can simulate certain states of the api (like an empty or non-empty db)
  // in order to cover different scenarios
  // the state could have many more variables; it is a good practice to represent it as an object
  // note that the consumer state name should match the provider side

  // * The purpose of the stateHandlers is to ensure that the provider is in the correct state
  // to fulfill the consumer's expectations as defined in the contract tests.
  // * In a real-world scenario, you would typically set up this state by interacting with your service's database
  // * or through an API provided by the service itself (locally).
  // * This ensures that the provider test runs in a controlled environment where all the necessary data
  // and conditions are met, allowing for accurate verification of the consumer's expectations.
  describe('When a GET request is made to a specific movie ID', () => {
    it('should return a specific movie', async () => {
      const testId = 100
      const EXPECTED_BODY = { id: testId, name: 'My movie', year: 1999 }

      const [stateName, stateParams] = createProviderState({
        name: 'Has a movie with a specific ID',
        params: { id: testId }
      })

      provider
        .given(stateName, stateParams)
        .uponReceiving('a request to a specific movie')
        .withRequest({
          method: 'GET',
          path: `/movie/${testId}`
        })
        .willRespondWith({
          status: 200,
          body: {
            id: integer(testId),
            name: string(EXPECTED_BODY.name),
            year: integer(EXPECTED_BODY.year)
          }
        })

      await provider.executeTest(async (mockServer: V3MockServer) => {
        const res = await fetchSingleMovie(mockServer.url, testId)
        expect(res).toEqual(EXPECTED_BODY)
      })
    })

    it('should handle errors when movie not found', async () => {
      const testId = 999
      const errorRes: ErrorResponse = { error: 'Movie not found' }

      provider
        .uponReceiving('a request to a non-existing movie')
        .withRequest({
          method: 'GET',
          path: `/movie/${testId}`
        })
        .willRespondWith({
          status: 404,
          body: errorRes
        })

      await provider.executeTest(async (mockServer: V3MockServer) => {
        const result = await fetchSingleMovie(mockServer.url, testId)
        expect(result).toEqual(errorRes)
      })
    })
  })

  describe('When a POST request is made to /movies', () => {
    it('should add a new movie', async () => {
      const { name, year }: Omit<Movie, 'id'> = {
        name: 'New movie',
        year: 1999
      }

      provider
        .uponReceiving('a request to add a new movie')
        .withRequest({
          method: 'POST',
          path: '/movies',
          body: { name, year }
        })
        .willRespondWith({
          status: 200,
          body: {
            id: integer(), // if the example value is omitted, a random number is used
            name: string(name),
            year: integer(year)
          }
        })

      await provider.executeTest(async (mockServer: V3MockServer) => {
        const res = await addNewMovie(mockServer.url, name, year)
        expect(res).toEqual({
          id: expect.any(Number),
          name,
          year
        })
      })
    })

    it('should not add a movie that already exists', async () => {
      const movie: Omit<Movie, 'id'> = {
        name: 'My existing movie',
        year: 2001
      }
      const errorRes: ErrorResponse = {
        error: `Movie ${movie.name} already exists`
      }

      const [stateName, stateParams] = createProviderState({
        name: 'An existing movie exists',
        params: movie
      })

      provider
        .given(stateName, stateParams)
        .uponReceiving('a request to the existing movie')
        .withRequest({
          method: 'POST',
          path: '/movies',
          body: { ...movie }
        })
        .willRespondWith({
          status: 409,
          body: errorRes
        })

      await provider.executeTest(async (mockServer: V3MockServer) => {
        const res = await addNewMovie(mockServer.url, movie.name, movie.year)
        expect(res).toEqual(errorRes)
      })
    })
  })

  describe('When a DELETE request is made to /movies', () => {
    it('should delete an existing movie successfully', async () => {
      const testId = 100
      const successRes: SuccessResponse = {
        message: `Movie ${testId} has been deleted`
      }

      const state = createProviderState({
        name: 'Has a movie with a specific ID',
        params: { id: testId }
      })

      provider
        .given(...state)
        .uponReceiving('a request to delete a movie that exists')
        .withRequest({
          method: 'DELETE',
          path: `/movie/${testId}`
        })
        .willRespondWith({
          status: 200,
          body: successRes
        })

      await provider.executeTest(async (mockServer: V3MockServer) => {
        const res = await deleteMovie(mockServer.url, testId)
        expect(res).toEqual(successRes)
      })
    })

    it('should throw an error if movie to delete does not exist', async () => {
      const testId = 123456789
      const errorRes: ErrorResponse = {
        error: `Movie ${testId} not found`
      }

      provider
        .uponReceiving('a request to delete a non-existing movie')
        .withRequest({
          method: 'DELETE',
          path: `/movie/${testId}`
        })
        .willRespondWith({
          status: 404,
          body: errorRes
        })

      await provider.executeTest(async (mockServer: V3MockServer) => {
        const res = await deleteMovie(mockServer.url, testId)
        expect(res).toEqual(errorRes)
      })
    })
  })
})
