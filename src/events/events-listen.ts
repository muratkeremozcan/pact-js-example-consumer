// consuming Kafka events is purely optional
// for them to be seen in action, the provider repo has to be started
// docker has to be started, and kafka:start script has be executed in the provider repo
// we have e2e tests in the provider that execute if kafka is up
// the intent is to test events with pact while no kafka is running

import express from 'express'
import { consumeMovieEvents } from './movie-events'

const app = express()
const port = process.env.CLIENTPORT || 3000

// start the Kafka consumer when the application starts
consumeMovieEvents()

app.listen(port, () => {
  console.log(`Movie Consumer API listening at http://localhost:${port}`)
})
