import type { Movie } from '../../src/consumer'
import { generateMovie } from '../support/factories'
import spok from 'cy-spok'
import { retryableBefore } from '../support/retryable-before'

describe('CRUD movie', () => {
  const movie = generateMovie()
  const updatedMovie = { name: 'Updated Name', year: 2000 }
  const movieProps: Omit<Movie, 'id'> = {
    name: spok.string,
    year: spok.number,
    rating: spok.number,
    director: spok.string
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
      .should(spok({ data: movieProps, status: 200 }))
      .print()
      .its('data.id')
      .then((id) => {
        cy.getMovies()
          .should(spok({ data: spok.array, status: 200 }))
          .findOne({ name: movie.name })

        cy.getMovieById(id)
          .its('data')
          .should(
            spok({
              ...movieProps,
              id
            })
          )
          .its('name')
          .then((name) => {
            cy.getMovieByName(name)
              .its('data')
              .should(
                spok({
                  ...movieProps,
                  id
                })
              )
          })

        cy.updateMovie(id, updatedMovie).should(
          spok({
            data: {
              id,
              name: updatedMovie.name,
              year: updatedMovie.year
            },
            status: 200
          })
        )

        cy.deleteMovie(id).should(
          spok({ status: 200, message: `Movie ${id} has been deleted` })
        )
        cy.getMovies().findOne({ name: updatedMovie.name }).should('not.exist')
      })
  })
})
