import type { V3MockServer } from '@pact-foundation/pact'
import { MatchersV3, PactV4 } from '@pact-foundation/pact'
import path from 'path'
import type { ErrorResponse, Movie } from './consumer'
import {
  addMovie,
  deleteMovieById,
  getMovies,
  getMovieById,
  getMovieByName,
  updateMovie
} from './consumer'
import { createProviderState, setJsonBody } from './test-helpers/helpers'
import type {
  DeleteMovieResponse,
  GetMovieResponse,
  MovieNotFoundResponse
} from './provider-schema/movie-types'

// full list of matchers:
// https://docs.pact.io/implementation_guides/javascript/docs/matching#v3-matching-rules
const { like, eachLike, integer, decimal, string } = MatchersV3

// 1) Setup the mock provider for the consumer
// 2) Register the consumer's expectations against the (mock) provider
// 3) Call the consumer against the mock provider
// 4) Verify the consumer test and generate the contract

// 1) Setup the mock provider for the consumer
const pact = new PactV4({
  dir: path.resolve(process.cwd(), 'pacts'),
  consumer: 'WebConsumer',
  provider: 'MoviesAPI'
  // logLevel: 'debug'
})

describe('Movies API', () => {
  describe('When a GET request is made to /movies', () => {
    it('should return all movies', async () => {
      // loose matching: the consumer should care more about the shape of the data
      const EXPECTED_BODY: Movie = {
        id: 1,
        name: 'My movie',
        year: 1999,
        rating: 8.5
      }

      // we want to ensure at least 1 movie is returned in the array of movies
      const [stateName, stateParams] = createProviderState({
        name: 'An existing movie exists',
        params: EXPECTED_BODY
      })

      // 2) Register the consumer's expectations against the (mock) provider
      await pact
        .addInteraction()
        .given(stateName, stateParams)
        .uponReceiving('a request to get all movies')
        .withRequest('GET', '/movies')
        .willRespondWith(
          200,
          setJsonBody({
            status: 200,
            data: eachLike(EXPECTED_BODY)
          })
        )
        .executeTest(async (mockServer: V3MockServer) => {
          // 3) Call the consumer against the mock provider
          const res = await getMovies(mockServer.url)
          // 4) Verify the consumer test and generate the contract
          expect(res.data).toEqual([EXPECTED_BODY])
        })
    })

    it('should return empty when no movies exist', async () => {
      const EXPECTED_BODY: Movie[] = []

      await pact
        .addInteraction()
        .given('No movies exist')
        .uponReceiving('a request to get all movies')
        .withRequest('GET', '/movies')
        .willRespondWith(
          200,
          setJsonBody({ status: 200, data: like(EXPECTED_BODY) })
        )
        .executeTest(async (mockServer: V3MockServer) => {
          const res = await getMovies(mockServer.url)
          expect(res.data).toEqual(EXPECTED_BODY)
        })
    })

    it('should return a movie by name when requested with query parameters', async () => {
      const EXPECTED_BODY: Movie = {
        id: 1,
        name: 'My movie',
        year: 1999,
        rating: 8.5
      }

      // we want to ensure at least 1 movie is returned in the array of movies
      const [stateName, stateParams] = createProviderState({
        name: 'An existing movie exists',
        params: EXPECTED_BODY
      })

      await pact
        .addInteraction()
        .given(stateName, stateParams)
        .uponReceiving('a request to get a movie by name')
        .withRequest('GET', '/movies', (builder) => {
          builder.query({ name: EXPECTED_BODY.name }) // Use query to specify query parameters
        })
        .willRespondWith(
          200,
          setJsonBody({
            status: 200,
            data: {
              id: integer(EXPECTED_BODY.id),
              name: string(EXPECTED_BODY.name),
              year: integer(EXPECTED_BODY.year),
              rating: decimal(EXPECTED_BODY.rating)
            }
          })
        )
        .executeTest(async (mockServer: V3MockServer) => {
          const res = (await getMovieByName(
            mockServer.url,
            EXPECTED_BODY.name
          )) as GetMovieResponse
          expect(res.data).toEqual(EXPECTED_BODY)
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
      const EXPECTED_BODY: Movie = {
        id: testId,
        name: 'My movie',
        year: 1999,
        rating: 8.5
      }

      const [stateName, stateParams] = createProviderState({
        name: 'Has a movie with a specific ID',
        params: { id: testId }
      })

      await pact
        .addInteraction()
        .given(stateName, stateParams)
        .uponReceiving('a request to a specific movie')
        .withRequest('GET', `/movies/${testId}`)
        .willRespondWith(
          200,
          setJsonBody({
            status: 200,
            data: {
              id: integer(testId),
              name: string(EXPECTED_BODY.name),
              year: integer(EXPECTED_BODY.year),
              rating: decimal(EXPECTED_BODY.rating)
            }
          })
        )
        .executeTest(async (mockServer: V3MockServer) => {
          const res = (await getMovieById(
            mockServer.url,
            testId
          )) as GetMovieResponse
          expect(res.data).toEqual(EXPECTED_BODY)
        })
    })
  })

  describe('When a POST request is made to /movies', () => {
    it('should add a new movie', async () => {
      const movie: Omit<Movie, 'id'> = {
        name: 'New movie',
        year: 1999,
        rating: 8.5
      }

      await pact
        .addInteraction()
        .given('No movies exist')
        .uponReceiving('a request to add a new movie')
        .withRequest('POST', '/movies', setJsonBody(movie))
        .willRespondWith(
          200,
          setJsonBody({
            status: 200,
            data: {
              id: integer(), // if the example value is omitted, a random number is used
              name: string(movie.name),
              year: integer(movie.year),
              rating: decimal(movie.rating)
            }
          })
        )
        .executeTest(async (mockServer: V3MockServer) => {
          const res = await addMovie(mockServer.url, movie)
          expect(res).toEqual({
            status: 200,
            data: {
              id: expect.any(Number),
              name: movie.name,
              year: movie.year,
              rating: movie.rating
            }
          })
        })
    })

    it('should not add a movie that already exists', async () => {
      const movie: Omit<Movie, 'id'> = {
        name: 'My existing movie',
        year: 2001,
        rating: 8.5
      }
      const errorRes: ErrorResponse = {
        error: `Movie ${movie.name} already exists`
      }

      const [stateName, stateParams] = createProviderState({
        name: 'An existing movie exists',
        params: movie
      })

      await pact
        .addInteraction()
        .given(stateName, stateParams)
        .uponReceiving('a request to the existing movie')
        .withRequest('POST', '/movies', setJsonBody(movie))
        .willRespondWith(409, setJsonBody(errorRes))
        .executeTest(async (mockServer: V3MockServer) => {
          const res = await addMovie(mockServer.url, movie)
          expect(res).toEqual(errorRes)
        })
    })
  })

  describe('When a PUT request is made to a specific movie ID', () => {
    it('should update an existing movie', async () => {
      const testId = 99
      const updatedMovieData = {
        name: 'Updated movie',
        year: 2000,
        rating: 8.5
      }

      const [stateName, stateParams] = createProviderState({
        name: 'Has a movie with a specific ID',
        params: { id: testId }
      })

      await pact
        .addInteraction()
        .given(stateName, stateParams)
        .uponReceiving('a request to update a specific movie')
        .withRequest('PUT', `/movies/${testId}`, setJsonBody(updatedMovieData))
        .willRespondWith(
          200,
          setJsonBody({
            status: 200,
            data: {
              id: integer(testId),
              name: updatedMovieData.name,
              year: updatedMovieData.year,
              rating: updatedMovieData.rating
            }
          })
        )
        .executeTest(async (mockServer: V3MockServer) => {
          const res = await updateMovie(
            mockServer.url,
            testId,
            updatedMovieData
          )

          expect(res).toEqual({
            status: 200,
            data: {
              id: testId,
              name: updatedMovieData.name,
              year: updatedMovieData.year,
              rating: updatedMovieData.rating
            }
          })
        })
    })
  })

  describe('When a DELETE request is made to /movies', () => {
    it('should delete an existing movie successfully', async () => {
      const testId = 100
      const message = `Movie ${testId} has been deleted`

      const state = createProviderState({
        name: 'Has a movie with a specific ID',
        params: { id: testId }
      })

      await pact
        .addInteraction()
        .given(...state)
        .uponReceiving('a request to delete a movie that exists')
        .withRequest('DELETE', `/movies/${testId}`)
        .willRespondWith(200, setJsonBody({ status: 200, message }))
        .executeTest(async (mockServer: V3MockServer) => {
          const res = (await deleteMovieById(
            mockServer.url,
            testId
          )) as DeleteMovieResponse
          expect(res.message).toEqual(message)
        })
    })

    it('should throw an error if movie to delete does not exist', async () => {
      const testId = 123456789
      const error = `Movie with ID ${testId} not found`

      await pact
        .addInteraction()
        .uponReceiving('a request to delete a non-existing movie')
        .withRequest('DELETE', `/movies/${testId}`)
        .willRespondWith(404, setJsonBody({ status: 404, error }))
        .executeTest(async (mockServer: V3MockServer) => {
          const res = (await deleteMovieById(
            mockServer.url,
            testId
          )) as MovieNotFoundResponse

          expect(res.error).toEqual(error)
        })
    })
  })
})
