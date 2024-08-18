const Joi = require('joi')

// the class encapsulates all business logic related to movie management
// this allows for clear separation from the HTTP layer (Encapsulation, Single Responsibility Principle)

class Movie {
  constructor() {
    this.movies = []
  }

  getMovies() {
    return this.movies
  }

  getMovieById(id) {
    return this.movies.find((movie) => parseInt(id) === movie.id)
  }

  getMovieByName(name) {
    return this.movies.find((movie) => movie.name === name)
  }

  insertMovie(movie) {
    this.movies.push(movie)
  }

  getFirstMovie() {
    return this.movies[0]
  }

  deleteMovieById(id) {
    const index = this.movies.findIndex((movie) => movie.id === parseInt(id))
    if (index === -1) return false

    this.movies.splice(index, 1)
    return true
  }

  addMovie(data) {
    const schema = Joi.object({
      name: Joi.string().required(),
      year: Joi.number().integer().min(1900).max(2023).required()
    })

    const result = schema.validate(data)
    if (result.error)
      return { error: result.error.details[0].message, status: 400 }

    if (this.getMovieByName(data.name))
      return { error: `Movie ${data.name} already exists`, status: 409 }

    const lastMovie = this.movies[this.movies.length - 1]

    const movie = {
      id: lastMovie ? lastMovie.id + 1 : 1,
      name: data.name,
      year: data.year
    }

    this.insertMovie(movie)
    return { movie, status: 200 }
  }
}

module.exports = Movie
