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
      .tap()
      .should(
        spok({
          status: 200,
          body: { message: 'Server is running' }
        })
      )
  })

  it('should crud', () => {
    cy.addMovie(movie)
      .should(
        spok({
          status: 200,
          body: movieProps
        })
      )
      .its('body.id')
      .then((id) => {
        cy.getAllMovies()
          .should(
            spok({
              status: 200,
              body: spok.array
            })
          )
          .its('body')
          .findOne({ name: movie.name })

        cy.getMovieById(id).should(
          spok({
            status: 200,
            body: {
              ...movieProps,
              id
            }
          })
        )

        cy.deleteMovie(id)
        cy.getAllMovies()
          .its('body')
          .findOne({ name: movie.name })
          .should('not.exist')
      })
  })
})
