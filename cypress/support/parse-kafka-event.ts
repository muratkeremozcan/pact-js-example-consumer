import type { Movie } from '../../src/consumer'
import { logFilePath } from '../../src/events/log-file-path'
import type { MovieAction } from '../../src/events/movie-event-types'

type Entry = Movie & { topic: string }

/**
 * Curried filter function to filter by topic and movieId
 *
 * @param {number} movieId - The ID of the movie to filter by.
 * @param {string} topic - The Kafka topic to filter by.
 * @returns {(entries: Array<ReturnType<typeof reshape>>) => Array} - A function that filters entries based on the topic and movieId.
 */
const filterByTopicAndId =
  (movieId: number, topic: string) => (entries: Entry[]) =>
    entries.filter((entry: Entry) => {
      return entry.topic === topic && entry.id === movieId
    })

/**
 * Parses the Kafka event log file and filters events based on the topic and movieId.
 *
 * @param {number} movieId - The ID of the movie to filter for.
 * @param {MovieAction} topic - The Kafka topic to filter by.
 * @param {string} [filePath=logFilePath] - Optional file path for the Kafka event log file.
 * @returns {Cypress.Chainable} - A Cypress chainable that resolves to the first matching event.
 */
export const parseKafkaEvent = (
  movieId: number,
  topic: `movie-${MovieAction}`,
  filePath = logFilePath
) =>
  cy
    .print('parsing Kafka events..')
    .readFile(filePath)
    .invoke('trim')
    .invoke('split', '\n')
    .map(JSON.parse)
    .apply(filterByTopicAndId(movieId, topic))
