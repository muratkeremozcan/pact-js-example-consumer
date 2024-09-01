import type { JsonMap } from '@pact-foundation/pact/src/common/jsonTypes'

/**
 * Converts an object with arbitrary value types to a JsonMap where all values are strings.
 * This is useful for ensuring compatibility with functions that expect all values in the map
 * to be strings, such as in Pact state management.
 *
 * The function handles `null`, `undefined`, and object values by converting them to a string representation.
 * If a value is an object, it will be serialized using `JSON.stringify`.
 *
 * @param {Record<string, unknown>} obj - The object to convert, with string keys and values of any type.
 * @returns {JsonMap} - A new object where all values are strings.
 *
 * @example
 * const movie = { name: 'Inception', year: 2010, director: { firstName: 'Christopher', lastName: 'Nolan' } }
 * toJsonMap(movie) // { name: 'Inception', year: '2010', director: '{"firstName":"Christopher","lastName":"Nolan"}' }
 */
const toJsonMap = (obj: Record<string, unknown>): JsonMap =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (value === null || value === undefined) {
        return [key, 'null']
      } else if (typeof value === 'object') {
        return [key, JSON.stringify(value)]
      } else {
        return [key, String(value)]
      }
    })
  )

type ProviderStateInput = {
  name: string
  params: Record<string, unknown>
}

/**
 * Creates a tuple representing a provider state for use with Pact.
 * The function takes a state name and an object of parameters, converting
 * the parameters into a JsonMap where all values are strings.
 *
 * This function is useful for simplifying the setup of provider states in tests
 * by ensuring the parameters are in the correct format required by Pact.
 *
 * @param {Object} options - The options for creating the provider state.
 * @param {string} options.name - The name of the provider state.
 * @param {Record<string, unknown>} options.params - The parameters for the provider state, with string keys and values of any type.
 *
 * @returns {[string, JsonMap]} - A tuple containing the state name and the converted parameters.
 *
 * @example
 *  * const movie: Movie = {
 *   name: 'My existing movie',
 *   year: 2001
 * }
 *
 * const state = createProviderState({
 *   name: 'An existing movie exists',
 *   params: movie
 * })
 *
 * provider.given(...state)
 *
 * // OR
 *
 * const [stateName, stateParams] = createProviderState({
 *   name: 'An existing movie exists',
 *   params: movie
 * })
 *
 * provider.given(stateName, stateParams)
 */
export const createProviderState = ({
  name,
  params
}: ProviderStateInput): [string, JsonMap] => [name, toJsonMap(params)]
