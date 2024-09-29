import log from './log'
import {
  fetchMovies,
  fetchSingleMovie,
  addNewMovie,
  deleteMovieById
} from '../../src/consumer'

/**
 * The collection of tasks to use with `cy.task()`
 * @param on `on` is used to hook into various events Cypress emits
 */
export default function tasks(on: Cypress.PluginEvents) {
  on('task', { log })

  on('task', { fetchMovies })

  // KEY: a pattern to fine tune cy task when handling multiple arguments
  // Cypress tasks only accept a single argument, but we can pass multiple values
  // by wrapping them inside an object. This ensures the argument is serializable,
  // which is a requirement for passing data between Cypress and Node.js.
  // Adjust functions to expect an object, even if the original function took multiple arguments.
  on('task', {
    // the cy task
    fetchSingleMovie: ({ url, id }: { url: string; id: number }) =>
      // the original function
      fetchSingleMovie(url, id)
  })
  on('task', {
    addNewMovie: ({
      url,
      movieName,
      movieYear
    }: {
      url: string
      movieName: string
      movieYear: number
    }) => addNewMovie(url, movieName, movieYear)
  })
  on('task', {
    deleteMovieById: ({ url, id }: { url: string; id: number }) =>
      deleteMovieById(url, id)
  })
}
