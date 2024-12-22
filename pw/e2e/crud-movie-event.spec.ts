import { test, expect } from '../support/fixtures'
import { runCommand } from '../support/utils/run-command'
import { recurseWithExpect } from '../support/utils/recurse-with-expect'
import {
  getMovies,
  getMovieById,
  getMovieByName,
  addMovie,
  deleteMovieById,
  updateMovie
} from '../../src/consumer'
import { generateMovie } from '../../cypress/support/factories'
import type {
  CreateMovieResponse,
  GetMovieResponse,
  UpdateMovieResponse,
  DeleteMovieResponse
} from '../../src/provider-schema/movie-types'
import { parseKafkaEvent } from '../support/parse-kafka-event'

const serverPort = process.env.SERVERPORT || 3001
const apiUrl = `http://localhost:${serverPort}`

test.describe('CRUD movie', () => {
  const movie = generateMovie()
  const updatedMovie = { name: 'Updated Name', year: 2000 }
  const movieProps = {
    name: expect.any(String),
    year: expect.any(Number),
    rating: expect.any(Number),
    director: expect.any(String)
  }

  test.beforeAll('should get server status', async ({ apiRequest }) => {
    const responseCode = runCommand(
      `curl -s -o /dev/null -w "%{http_code}" ${process.env.KAFKA_UI_URL}`
    )
    if (responseCode !== '200') {
      test.skip()
    }

    const {
      body: { message }
    } = await apiRequest<{ message: string }>({
      method: 'GET',
      url: '/'
    })
    expect(message).toBe('Server is running')
  })

  test('should', () => {
    console.log('work')
  })

  test('should crud', async () => {
    // Add a movie
    const { data: addMovieData, status: addMovieStatus } = (await addMovie(
      apiUrl,
      movie
    )) as CreateMovieResponse
    expect(addMovieStatus).toBe(200)
    expect(addMovieData).toMatchObject(movieProps)

    const movieId = addMovieData.id

    // Wait for 'movie-created' Kafka event using recurseWithExpect
    await recurseWithExpect(
      async () => {
        const topic = 'movie-created'
        const events = await parseKafkaEvent(movieId, topic)

        // Assert the structure of the Kafka event
        expect(events).toEqual([
          {
            topic,
            id: movieId,
            ...movieProps
          }
        ])
      },
      { timeout: 10000, interval: 500 }
    )

    // Get all movies and verify the new movie exists
    const { status: getMoviesStatus, data: getMoviesData } =
      await getMovies(apiUrl)
    expect(getMoviesStatus).toBe(200)
    expect(getMoviesData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: movieId, name: movie.name })
      ])
    )

    // Get the movie by ID
    const { data: getMovieByIdData, status: getMovieByIdStatus } =
      (await getMovieById(apiUrl, movieId)) as GetMovieResponse
    expect(getMovieByIdStatus).toBe(200)
    expect(getMovieByIdData).toMatchObject({
      id: movieId,
      ...movieProps
    })

    // Get the movie by name
    const { data: getMovieByNameData, status: getMovieByNameStatus } =
      (await getMovieByName(apiUrl, movie.name)) as GetMovieResponse
    expect(getMovieByNameStatus).toBe(200)
    expect(getMovieByNameData).toEqual(
      expect.objectContaining({
        id: movieId,
        ...movieProps
      })
    )

    // Update the movie
    const { data: updateMovieData, status: updateMovieStatus } =
      (await updateMovie(apiUrl, movieId, updatedMovie)) as UpdateMovieResponse
    expect(updateMovieStatus).toBe(200)
    expect(updateMovieData).toMatchObject({
      id: movieId,
      ...updatedMovie
    })

    await recurseWithExpect(
      async () => {
        const topic = 'movie-updated'
        const event = await parseKafkaEvent(movieId, topic)

        // Perform assertions on the event content
        expect(event).toEqual([
          {
            topic,
            id: movieId,
            ...movieProps
          }
        ])
      },
      { timeout: 10000, interval: 500 }
    )

    // Delete the movie
    const { status: deleteMovieStatus, message: deleteMovieMessage } =
      (await deleteMovieById(apiUrl, movieId)) as DeleteMovieResponse
    expect(deleteMovieStatus).toBe(200)
    expect(deleteMovieMessage).toBe(`Movie ${movieId} has been deleted`)

    await recurseWithExpect(
      async () => {
        const topic = 'movie-deleted'
        const event = await parseKafkaEvent(movieId, topic)

        // Perform assertions on the event content
        expect(event).toEqual([
          {
            topic,
            id: movieId,
            ...movieProps
          }
        ])
      },
      { timeout: 10000, interval: 500 }
    )

    // Verify the movie no longer exists
    const allMoviesAfterDelete = await getMovies(apiUrl)
    expect(allMoviesAfterDelete.data).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: movieId, name: updatedMovie.name })
      ])
    )
  })
})
