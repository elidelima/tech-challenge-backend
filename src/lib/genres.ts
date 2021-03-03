import { knex } from '../util/knex'
import { Actor } from './actors'

export interface Genre {
  id: number
  name: string
}

export function list(): Promise<Genre[]> {
  return knex.from('genre').select()
}

export function find(id: number): Promise<Genre> {
  return knex.from('genre').where({ id }).first()
}

/** @returns whether the ID was actually found */
export async function remove(id: number): Promise<boolean> {
  const count = await knex.from('genre').where({ id }).delete()
  return count > 0
}

/** @returns the ID that was created */
export async function create(name: string): Promise<number> {
  const [ id ] = await (knex.into('genre').insert({ name }))
  return id
}

/** @returns whether the ID was actually found */
export async function update(id: number, name: string): Promise<boolean>  {
  const count = await knex.from('genre').where({ id }).update({ name })
  return count > 0
}

// TODO maybe should move this to  actor.ts
export async function listActorsByMovieAppearances(genreId: number): Promise<Actor[]> {
  return knex
    .select('actor.id', 'actor.name', 'actor.bio', 'actor.bornAt')
    .select(knex.raw('COUNT(actor.id) as appearances'))
    .from('movie_character')
    .join('actor', 'movie_character.actorId', '=', 'actor.id')
    .join('movie', 'movie_character.movieId', '=', 'movie.id')
    .where('movie.genreId', genreId)
    .groupBy('actor.id')
    .orderBy('appearances', 'desc')
}

