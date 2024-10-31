/* eslint-disable @typescript-eslint/no-namespace */
import type { Movie } from '../src/consumer'
export {}

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /** Gets a list of movies
       * ```js
       * cy.getMovies()
       * ```
       */
      getMovies(url?: string): Chainable<Response<Movie[]> & Messages>

      /** Gets a movie by id
       * ```js
       * cy.getMovieById(1)
       * ```
       */
      getMovieById(
        id: number,
        url?: string
      ): Chainable<Response<Movie> & Messages>

      /** Gets a movie by name
       * ```js
       * cy.getMovieByName('The Great Gatsby')
       * ```
       */
      getMovieByName(
        name: string,
        url?: string
      ): Chainable<Response<Movie> & Messages>

      /** Creates a movie
       * ```js
       * cy.addMovie({name: 'The Great Gatsby', year: 1925  })
       * ```
       */
      addMovie(
        body: Omit<Movie, 'id'>,
        url?: string
      ): Chainable<Response<Omit<Movie, 'id'>> & Messages>

      /** Deletes a movie
       * ```js
       * cy.deleteMovie(1)
       * ```
       */
      deleteMovie(
        id: number,
        url?: string
      ): Chainable<Response<Movie> & Messages>

      /** Updates a movie
       * ```js
       * cy.updateMovie(1, {name: 'The Great Gatsby Updated', year: 2000})
       * ```
       */
      updateMovie(
        id: number,
        body: Partial<Movie>,
        url?: string
      ): Chainable<Response<Movie> & Messages>

      /** https://www.npmjs.com/package/@cypress/skip-test
       * `cy.skipOn('localhost')` */
      skipOn(
        nameOrFlag: string | boolean | (() => boolean),
        cb?: () => void
      ): Chainable<Subject>

      /** https://www.npmjs.com/package/@cypress/skip-test
       * `cy.onlyOn('localhost')` */
      onlyOn(
        nameOrFlag: string | boolean | (() => boolean),
        cb?: () => void
      ): Chainable<Subject>
    }
  }
}
