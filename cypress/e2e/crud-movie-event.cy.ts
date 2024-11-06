import '@cypress/skip-test/support'

import type { Movie } from '../../src/consumer'
import { generateMovie } from '../support/factories'
import spok from 'cy-spok'
import { retryableBefore } from '../support/retryable-before'
import { parseKafkaEvent } from '../support/parse-kafka-event'
import { recurse } from 'cypress-recurse'

describe('CRUD movie', () => {
  const movie = generateMovie()
  const updatedMovie = { name: 'Updated Name', year: 2000, rating: 8.5 }
  const movieProps: Omit<Movie, 'id'> = {
    name: spok.string,
    year: spok.number,
    rating: spok.number,
    director: spok.string
  }

  retryableBefore(() => {
    cy.exec(
      `curl -s -o /dev/null -w "%{http_code}" ${Cypress.env('KAFKA_UI_URL')}`,
      {
        failOnNonZeroExit: false
      }
    ).then((res) => {
      cy.log('**npm run kafka:start at the server to enable this test**')
      cy.skipOn(res.stdout !== '200')
    })

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
        recurse(
          () => parseKafkaEvent(id, 'movie-created'),
          spok([
            {
              id,
              name: movie.name,
              year: movie.year,
              topic: 'movie-created'
            }
          ])
        )

        cy.getMovies().should(spok(spok.array)).findOne({ name: movie.name })

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
        recurse(
          () => parseKafkaEvent(id, 'movie-updated'),
          spok([
            {
              id,
              name: updatedMovie.name,
              year: updatedMovie.year,
              topic: 'movie-updated'
            }
          ])
        )

        cy.deleteMovie(id)
        recurse(
          () => parseKafkaEvent(id, 'movie-deleted'),
          spok([
            {
              id,
              name: updatedMovie.name,
              year: updatedMovie.year,
              topic: 'movie-deleted'
            }
          ])
        )
        cy.getMovies().findOne({ name: movie.name }).should('not.exist')
      })
  })
})
