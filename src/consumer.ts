import axios, { AxiosResponse, AxiosError } from 'axios'

type Movie = {
  name: string
  year: number
}
export type ErrorResponse = {
  error: string
}
export type MovieResponse = Movie & { id: number }
export type SuccessResponse = {
  message: string
}
export type MoviesResponse = MovieResponse[]
export type DeleteMovieResponse = SuccessResponse | ErrorResponse

const yieldData = <T>(res: AxiosResponse<T>): T => res.data

const handleError = (err: AxiosError): ErrorResponse => {
  if (err.response?.data) return err.response.data as ErrorResponse
  return { error: 'Unexpected error occurred' }
}

const fetchMovies = (url: string): Promise<MoviesResponse | ErrorResponse> =>
  axios.get(`${url}/movies`).then(yieldData).catch(handleError)

const fetchSingleMovie = (
  url: string,
  id: number
): Promise<MovieResponse | ErrorResponse> =>
  axios.get(`${url}/movie/${id}`).then(yieldData).catch(handleError)

const addNewMovie = async (
  url: string,
  movieName: string,
  movieYear: number
): Promise<MovieResponse | ErrorResponse> => {
  const data: Movie = {
    name: movieName,
    year: movieYear
  }

  const response = await axios
    .post(`${url}/movies`, data)
    .then(yieldData)
    .catch(handleError)

  return response
}

const deleteMovie = (
  url: string,
  id: number
): Promise<SuccessResponse | ErrorResponse> =>
  axios.delete(`${url}/movie/${id}`).then(yieldData).catch(handleError)

export { fetchMovies, fetchSingleMovie, addNewMovie, deleteMovie }
