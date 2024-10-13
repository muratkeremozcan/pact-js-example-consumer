// these are a copy of the types at the provider/producer
// in the real world, they would be published as packages and installed here at the consumer

export type MovieAction = 'created' | 'updated' | 'deleted'
type Event<T extends string> = {
  topic: `movie-${T}`
  messages: Array<{
    key: string // id as string
    value: string // serialized movie object
  }>
}
export type MovieEvent = Event<MovieAction>
