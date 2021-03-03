import { knex } from '../util/knex'

export interface Movie {
  id: number
  name: string
  synopsis?: string
  releasedAt: Date
  runtime: number // minutes
  genreId: number // FK from genre
}
export interface MovieCharacter {
  movieId: number
  actorId: number
  name: string
}

export function list(): Promise<Movie[]> {
  return knex.from('movie').select()
}

export function find(id: number): Promise<Movie> {
  return knex.from('movie').where({ id }).first()
}

/** @returns whether the ID was actually found */
export async function remove(id: number): Promise<boolean> {
  const count = await knex.from('movie').where({ id }).delete()
  return count > 0
}

/** @returns the ID that was created */
export async function create(name: string, releasedAt: Date, runtime: number, genreId: number, synopsis?: string): Promise<number> {
  const [ id ] = await (knex.into('movie').insert({ name, releasedAt, runtime, synopsis, genreId }))
  return id
}

/** @returns whether the ID was actually found */
export async function update(id: number, name: string, releasedAt: Date, runtime: number, genreId: number, synopsis?: string): Promise<boolean>  {
  const count = await knex.from('movie').where({ id }).update({ name, releasedAt, runtime, genreId, synopsis })
  return count > 0
}


/** @returns the ID that was created */
export async function addMovieCharacter(movieId: number, actorId: number, name: string): Promise<MovieCharacter> {
  return knex.into('movie_character').insert({ movieId, actorId, name })
}

/** @returns the ID that was created */
export async function updateMovieCharacter(movieId: number, actorId: number, name: string): Promise<boolean> {
  const count = await knex.from('movie_character').where({ movieId, actorId }).update({ name })
  return count > 0
}

/** @returns the ID that was created */
export async function removeMovieCharacter(movieId: number, actorId: number): Promise<boolean> {
  const count = await knex.from('movie_character').where({ movieId, actorId }).delete()
  return count > 0
}

export function listMoviesCharacters(movieId: number): Promise<MovieCharacter[]> {
  return knex.select().from('movie_character').where('movieId', movieId)
}
