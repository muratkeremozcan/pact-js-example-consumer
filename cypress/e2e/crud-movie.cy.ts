import type { Movie } from '../../src/consumer'
import { generateMovie } from '../support/factories'
import spok from 'cy-spok'
import { retryableBefore } from '../support/retryable-before'

describe('CRUD movie', () => {
  const movie = generateMovie()
  const movieProps: Omit<Movie, 'id'> = {
    name: spok.string,
    year: spok.number
  }

  retryableBefore(() => {
    cy.api({
      method: 'GET',
      url: '/'
    })
      .its('body.message')
      .should('eq', 'Server is running')
  })

  it('should crud', () => {
    cy.addMovie(movie)
      .should(spok(movieProps))
      .its('id')
      .then((id) => {
        cy.getAllMovies().should(spok(spok.array)).findOne({ name: movie.name })

        cy.getMovieById(id).should(
          spok({
            ...movieProps,
            id
          })
        )

        cy.deleteMovie(id)
        cy.getAllMovies().findOne({ name: movie.name }).should('not.exist')
      })
  })
})
