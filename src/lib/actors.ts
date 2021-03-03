import { knex } from '../util/knex'
import { Genre } from './genres'
import { Movie } from './movies'

export interface Actor {
  id: number
  name: string
  bio: string
  bornAt: Date
}

export function list(): Promise<Actor[]> {
  return knex.from('actor').select()
}

export function find(id: number): Promise<Actor> {
  return knex.from('actor').where({ id }).first()
}

/** @returns whether the ID was actually found */
export async function remove(id: number): Promise<boolean> {
  const count = await knex.from('actor').where({ id }).delete()
  return count > 0
}

/** @returns the ID that was created */
export async function create(name: string, bio: string, bornAt: Date): Promise<number> {
  const [ id ] = await (knex.into('actor').insert({ name, bio, bornAt }))
  return id
}

/** @returns whether the ID was actually found */
export async function update(id: number, name: string, bio: string, bornAt: Date): Promise<boolean>  {
  const count = await knex.from('actor').where({ id }).update({ name, bio, bornAt })
  return count > 0
}

export async function listMovies(actorId: number): Promise<Movie[]> {
  return knex
    .select('movie.*')
    .from('movie')
    .join('movie_character', 'movie.id', '=', 'movieId')
    .where('movie_character.actorId', actorId)
}

export async function listCharacters(actorId: number): Promise<string[]> {
  return knex
    .select('movie_character.name')
    .from('movie_character')
    .where('movie_character.actorId', actorId)
}

/**
 * Business Rule: the favorite genre is the one with the most appearances.
 * TODO discuss what to do when genres have same count
 * @param actorId
 */
export async function getFavouriteGenre(actorId: number): Promise<Genre[]> {
  return knex
    .select('genre.id', 'genre.name')
    .select(knex.raw('COUNT(movie.genreId) as genre_count'))
    .from('genre')
    .join('movie', 'movie.genreId', '=', 'genre.id')
    .join('movie_character', 'movie.id', '=', 'movie_character.movieId')
    .where('movie_character.actorId', actorId)
    .groupBy('movie.genreId')
    .orderBy('genre_count', 'desc')
    .limit(1)
}

export async function listMoviesCountByGenre(actorId: number): Promise<Genre[]> {
  return knex
    .select('genre.id', 'genre.name')
    .select(knex.raw('COUNT(movie.genreId) as genre_count'))
    .from('genre')
    .join('movie', 'movie.genreId', '=', 'genre.id')
    .join('movie_character', 'movie.id', '=', 'movie_character.movieId')
    .where('movie_character.actorId', actorId)
    .groupBy('movie.genreId')

}

