import {
  MessageConsumerPact,
  Matchers,
  asynchronousBodyHandler
} from '@pact-foundation/pact'
import { consumeMovieEvents } from '../src/events/movie-events'
import path from 'node:path'

const { like, eachLike, term } = Matchers

describe('Kafka Movie Event Consumer', () => {
  const messagePact = new MessageConsumerPact({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'WebConsumer-event-consumer',
    provider: 'MoviesAPI-event-producer'
    // logLevel: 'debug'
  })

  const messages = eachLike({
    key: like('1'),
    value: {
      id: like(1),
      name: like('Inception'),
      year: like(2010)
    }
  })

  // generate: will be returned during mock consumer testing to simulate a valid response.
  // matcher: will be used to ensure that the provider returns a value that fits the expected pattern
  // when the contract is verified on the provider side.
  const matcher = '^movie-(created|updated|deleted)$' // The valid patterns for the event types

  // our consumeMovieEvents has some console.logs which we don't need during tests
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('should receive a movie-created event from Kafka', async () => {
    await messagePact
      .given('No movies exist')
      .expectsToReceive('a movie-created event')
      .withContent({
        topic: term({ generate: 'movie-created', matcher }),
        messages
      })
      .withMetadata({
        contentType: 'application/json'
      })
      .verify(asynchronousBodyHandler(consumeMovieEvents))
  })

  it('should receive a movie-updated event from Kafka', async () => {
    await messagePact
      .given('An existing movie exists')
      .expectsToReceive('a movie-updated event')
      .withContent({
        topic: term({ generate: 'movie-updated', matcher }),
        messages
      })
      .withMetadata({
        contentType: 'application/json'
      })
      .verify(asynchronousBodyHandler(consumeMovieEvents))
  })

  it('should receive a movie-deleted event from Kafka', async () => {
    await messagePact
      .given('An existing movie exists')
      .expectsToReceive('a movie-deleted event')
      .withContent({
        topic: term({ generate: 'movie-deleted', matcher }),
        messages
      })
      .withMetadata({
        contentType: 'application/json'
      })
      .verify(asynchronousBodyHandler(consumeMovieEvents))
  })
})
