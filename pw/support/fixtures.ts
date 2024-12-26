import { test as base, mergeTests } from '@playwright/test'
import { test as apiRequestFixture } from './fixtures/api-request-fixture'

// Merge the fixtures
const test = mergeTests(apiRequestFixture) // Add new fixtures as arguments

const expect = base.expect
export { test, expect }
