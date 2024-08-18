const axios = require('axios')

const fetchMovies = (url) =>
  axios
    .get(`${url}/movies`)
    .then((res) => res.data)
    .catch((err) => err.response)

const fetchSingleMovie = (url, id) =>
  axios
    .get(`${url}/movie/${id}`)
    .then((res) => res.data)
    .catch((err) => err.response)

const addNewMovie = async (url, movieName, movieYear) => {
  const data = {
    name: movieName,
    year: movieYear
  }

  const response = await axios
    .post(`${url}/movies`, data)
    .then((res) => res.data)
    .catch((err) => err.response.data.message)

  return response
}

const deleteMovie = (url, id) =>
  axios
    .delete(`${url}/movie/${id}`)
    .then((res) => res.data.message)
    .catch((err) => err.response.data.message)

module.exports = {
  fetchMovies,
  fetchSingleMovie,
  addNewMovie,
  deleteMovie
}
