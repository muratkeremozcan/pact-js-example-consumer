// consuming Kafka events is purely optional
// for them to be seen in action, the provider repo has to be started
// docker has to be started, and kafka:start script has be executed in the provider repo
// we have e2e tests in the provider that execute if kafka is up
// the real intent is to test events with pact while no kafka is running

import { Kafka } from 'kafkajs'
import type { MovieEvent } from './movie-event-types'

const kafka = new Kafka({
  clientId: 'movie-provider',
  brokers: ['localhost:29092'],
  // reduce retries and delays
  // so that those who don't start docker still have their crud fast
  retry: {
    retries: 2, // default 5
    initialRetryTime: 100, // delay initial (default 300 ms)
    maxRetryTime: 300 // delay between retries (default 30 secs)
  }
})

const consumer = kafka.consumer({ groupId: 'movie-group' })

export const consumeMovieEvents = async () => {
  try {
    await consumer.connect()
    console.log('Connected to Kafka successfully \n')

    await consumer.subscribe({ topic: 'movie-created', fromBeginning: true })
    await consumer.subscribe({ topic: 'movie-updated', fromBeginning: true })
    await consumer.subscribe({ topic: 'movie-deleted', fromBeginning: true })

    // handle the messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const movieEvent: MovieEvent = JSON.parse(
          message.value?.toString() || '{}'
        )

        console.group('\n Received event from Kafka:')
        console.log(`Topic: ${topic}`)
        console.log(`Partition: ${partition}`)
        console.table(movieEvent)
        console.groupEnd()
      }
    })
  } catch (err) {
    console.error(`\n Kafka broker unavailable, skipping event consumption 
			\n Kafka is purely optional, but it is there to test events (offline) with Pact. 
			\n If you want to see Kafka working, start the provider/producer server, 
			\n start docker desktop, and npm run kafka:start \n`)

    console.error(err instanceof Error ? err.message : 'Unknown error')
    await consumer.disconnect()
  }
}
