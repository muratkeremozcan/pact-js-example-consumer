const axios = require('axios')

const yieldData = (res) => res.data

const handleError = (err) => {
  if (err.response?.data) return err.response.data
  else return { error: 'Unexpected error occurred' }
}

const fetchMovies = (url) =>
  axios.get(`${url}/movies`).then(yieldData).catch(handleError)

const fetchSingleMovie = (url, id) =>
  axios.get(`${url}/movie/${id}`).then(yieldData).catch(handleError)

const addNewMovie = async (url, movieName, movieYear) => {
  const data = {
    name: movieName,
    year: movieYear
  }

  const response = await axios
    .post(`${url}/movies`, data)
    .then(yieldData)
    .catch(handleError)

  return response
}

const deleteMovie = (url, id) =>
  axios.delete(`${url}/movie/${id}`).then(yieldData).catch(handleError)

module.exports = {
  fetchMovies,
  fetchSingleMovie,
  addNewMovie,
  deleteMovie
}
