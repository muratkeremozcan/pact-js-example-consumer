import { baseConfig } from './base.config'
import merge from 'lodash/merge'
import { config as dotenvConfig } from 'dotenv'
import path from 'node:path'

dotenvConfig({
  path: path.resolve(__dirname, '../../.env')
})

const serverPort = process.env.SERVERPORT || 3001
const BASE_URL = `http://localhost:${serverPort}`

export default merge({}, baseConfig, {
  use: {
    baseURL: BASE_URL
  },
  webServer: {
    command: 'npm run mock:server',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe'
  }
})
