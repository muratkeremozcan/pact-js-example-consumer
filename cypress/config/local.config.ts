/* eslint-disable @typescript-eslint/no-var-requires */
import { defineConfig } from 'cypress'
import { baseConfig } from './base.config'
import path from 'node:path'
import merge from 'lodash/merge'

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
})

const serverPort = process.env.SERVERPORT || 3001

const config = {
  e2e: {
    env: {
      ENVIRONMENT: 'local',
      KAFKA_UI_URL: 'http://localhost:8085' // defined at the server src/events/kafka-cluster.yml L85, purely optional
    },
    baseUrl: `http://localhost:${serverPort}`
  }
}

export default defineConfig(merge({}, baseConfig, config))
