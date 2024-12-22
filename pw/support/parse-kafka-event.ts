import { promises as fs } from 'fs'
import { logFilePath } from '../../src/events/log-file-path'
import type {
  MovieAction,
  MovieEvent
} from '../../src/events/movie-event-types'

/**
 * Filters Kafka event entries by topic and movieId.
 *
 * @param {number} movieId - The ID of the movie to filter by.
 * @param {string} topic - The Kafka topic to filter by.
 * @param {Array<MovieEvent>} entries - The list of Kafka event entries.
 * @returns {Array<MovieEvent>} - Filtered entries based on the topic and movieId.
 */
const filterByTopicAndId = (
  movieId: number,
  topic: `movie-${MovieAction}`,
  entries: MovieEvent[]
) =>
  entries.filter(
    // @ts-expect-error can't figure it out
    (entry: MovieEvent) => entry.topic === topic && entry.id === movieId
  )

/**
 * Parses the Kafka event log file and filters events based on the topic and movieId.
 *
 * @param {number} movieId - The ID of the movie to filter for.
 * @param {`movie-${MovieAction}`} topic - The Kafka topic to filter by.
 * @param {string} [filePath=logFilePath] - Optional file path for the Kafka event log file.
 * @returns {Promise<MovieEvent[]>} - A promise that resolves to the matching events.
 */
export const parseKafkaEvent = async (
  movieId: number,
  topic: `movie-${MovieAction}`,
  filePath = logFilePath
): Promise<MovieEvent[]> => {
  try {
    // Read the log file content
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const entries: MovieEvent[] = fileContent
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line) as MovieEvent)

    // Filter the entries by topic and movie ID
    const filteredEntries = filterByTopicAndId(movieId, topic, entries)

    return filteredEntries
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error parsing Kafka event log: ${error.message}`)
    } else {
      console.error('An unknown error occurred:', error)
    }
    throw error
  }
}
