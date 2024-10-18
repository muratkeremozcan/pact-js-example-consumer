import log from './log'
import {
  getMovies,
  getMovieById,
  getMovieByName,
  addNewMovie,
  deleteMovieById,
  updateMovie
} from '../../src/consumer'

/**
 * The collection of tasks to use with `cy.task()`
 * @param on `on` is used to hook into various events Cypress emits
 */
export default function tasks(on: Cypress.PluginEvents) {
  on('task', { log })

  on('task', { getMovies: getMovies })

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

    addNewMovie: ({
      url,
      movieName,
      movieYear,
      movieRating
    }: {
      url: string
      movieName: string
      movieYear: number
      movieRating: number
    }) => addNewMovie(url, movieName, movieYear, movieRating),

    updateMovie: ({
      url,
      id,
      movieName,
      movieYear,
      movieRating
    }: {
      url: string
      id: number
      movieName: string
      movieYear: number
      movieRating: number
    }) => updateMovie(url, id, movieName, movieYear, movieRating)
  })
  // we can add them all together in one 'task', or separately
  on('task', {
    deleteMovieById: ({ url, id }: { url: string; id: number }) =>
      deleteMovieById(url, id)
  })
}
