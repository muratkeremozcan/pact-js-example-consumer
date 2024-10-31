import log from './log'
import type { Movie } from '../../src/consumer'
import {
  getMovies,
  getMovieById,
  getMovieByName,
  addMovie,
  deleteMovieById,
  updateMovie
} from '../../src/consumer'

/**
 * The collection of tasks to use with `cy.task()`
 * @param on `on` is used to hook into various events Cypress emits
 */
export default function tasks(on: Cypress.PluginEvents) {
  on('task', { log })

  // (a) => f(a)
  // () => f()
  // f
  on('task', { getMovies })

  // KEY: a pattern to fine tune cy task when handling multiple arguments
  // Cypress tasks only accept a single argument, but we can pass multiple values
  // by wrapping them inside an object. This ensures the argument is serializable,
  // which is a requirement for passing data between Cypress and Node.js.
  // Adjust functions to expect an object, even if the original function took multiple arguments.
  on('task', {
    // the cy task
    getMovieById: ({ url, id }: { url: string; id: number }) =>
      // the original function
      getMovieById(url, id),

    getMovieByName: ({ url, name }: { url: string; name: string }) =>
      getMovieByName(url, name),

    addMovie: ({ url, data }: { url: string; data: Omit<Movie, 'id'> }) =>
      addMovie(url, data),

    updateMovie: ({
      url,
      id,
      data
    }: {
      url: string
      id: number
      data: Partial<Omit<Movie, 'id'>>
    }) => updateMovie(url, id, data)
  })

  // we can add them all together in one 'task', or separately
  on('task', {
    deleteMovieById: ({ url, id }: { url: string; id: number }) =>
      deleteMovieById(url, id)
  })
}
