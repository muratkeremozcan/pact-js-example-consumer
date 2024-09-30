import type { AxiosResponse, AxiosError } from 'axios'
import axios from 'axios'

// Movie type from the provider, in the real world this would come from a published package
export type Movie = {
  id: number
  name: string
  year: number
}

// Error response type
export type ErrorResponse = {
  error: string
}

// Success response type
export type SuccessResponse = {
  message: string
}

// Helper function to extract data from Axios response
const yieldData = <T>(res: AxiosResponse<T>): T => res.data

// Helper function to handle errors
const handleError = (err: AxiosError): ErrorResponse => {
  if (err.response?.data) return err.response.data as ErrorResponse
  return { error: 'Unexpected error occurred' }
}

// Fetch all movies
export const getMovies = (url: string): Promise<Movie[] | ErrorResponse> =>
  axios.get(`${url}/movies`).then(yieldData).catch(handleError)

// Fetch a single movie by ID
export const getMovieById = (
  url: string,
  id: number
): Promise<Movie | ErrorResponse> =>
  axios.get(`${url}/movies/${id}`).then(yieldData).catch(handleError)

export const getMovieByName = (
  url: string,
  name: string
): Promise<Movie | ErrorResponse> =>
  axios.get(`${url}/movies?name=${name}`).then(yieldData).catch(handleError)

// Add a new movie (don't specify id)
export const addNewMovie = async (
  url: string,
  movieName: string,
  movieYear: number
): Promise<Movie | ErrorResponse> => {
  const data: Omit<Movie, 'id'> = {
    name: movieName,
    year: movieYear
  }

  const response = await axios
    .post(`${url}/movies`, data)
    .then(yieldData)
    .catch(handleError)

  return response
}

// Delete a movie by ID
export const deleteMovieById = (
  url: string,
  id: number
): Promise<SuccessResponse | ErrorResponse> =>
  axios.delete(`${url}/movies/${id}`).then(yieldData).catch(handleError)
