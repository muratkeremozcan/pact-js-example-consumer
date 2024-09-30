import './commands'
import 'cypress-map'
import '@bahmutov/cy-api'
import type { Movie } from '../../src/consumer'

const apiUrl = Cypress.config('baseUrl') || 'http://localhost:3001'

Cypress.Commands.add('getAllMovies', (url = apiUrl) => {
  cy.log('**getAllMovies**')
  return cy.task('getMovies', url)
})

Cypress.Commands.add('getMovieById', (id: number, url = apiUrl) => {
  cy.log(`**getMovieById: ${id}**`)
  return cy.task('getMovieById', { url, id }) // Pass an object with `url` and `id`
})

Cypress.Commands.add('getMovieByName', (name: string, url = apiUrl) => {
  cy.log(`**getMovieByName: ${name}**`)
  return cy.task('getMovieByName', { url, name })
})

Cypress.Commands.add('addMovie', (body: Omit<Movie, 'id'>, url = apiUrl) => {
  cy.log('**addMovie**')
  return cy.task('addNewMovie', {
    url,
    movieName: body.name,
    movieYear: body.year
  })
})

Cypress.Commands.add('deleteMovie', (id: number, url = apiUrl) => {
  cy.log('**deleteMovie by id: ${id}**')
  return cy.task('deleteMovieById', { url, id })
})
