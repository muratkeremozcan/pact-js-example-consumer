import type { Movie } from '../../src/consumer'
import { generateMovie } from '../support/factories'
import spok from 'cy-spok'
import { retryableBefore } from '../support/retryable-before'

describe('CRUD movie', () => {
  const movie = generateMovie()
  const updatedMovie = { name: 'Updated Name', year: 2000 }
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
      .should(spok({ movie: movieProps, status: 200 }))
      .print()
      .its('movie.id')
      .then((id) => {
        cy.getAllMovies().should(spok(spok.array)).findOne({ name: movie.name })

        cy.getMovieById(id)
          .should(
            spok({
              ...movieProps,
              id
            })
          )
          .its('name')
          .then((name) => {
            cy.getMovieByName(name).should(
              spok({
                ...movieProps,
                id
              })
            )
          })

        cy.updateMovie(id, updatedMovie).should(
          spok({
            movie: {
              id,
              name: updatedMovie.name,
              year: updatedMovie.year
            },
            status: 200
          })
        )

        cy.deleteMovie(id)
        cy.getAllMovies().findOne({ name: movie.name }).should('not.exist')
      })
  })
})
