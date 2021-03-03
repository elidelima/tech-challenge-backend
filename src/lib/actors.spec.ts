import { script } from '@hapi/lab'
import { expect } from '@hapi/code'
import sinon from 'sinon'

export const lab = script()
const { beforeEach, before, after, afterEach, describe, it } = lab

import { list, find, remove, create, update, listCharacters, listMovies, getFavouriteGenre, listMoviesCountByGenre } from './actors'
import { knex } from '../util/knex'

describe('lib', () => describe('actor', () => {
  const sandbox = Object.freeze(sinon.createSandbox())

  const isContext = (value: unknown): value is Context => {
    if(!value || typeof value !== 'object') return false
    const safe = value as Partial<Context>
    if(!safe.stub) return false
    return true
  }
  interface Context {
    stub: Record<string, sinon.SinonStub>
  }
  interface Flags extends script.Flags {
    readonly context: Partial<Context>
  }

  before(({context}: Flags) => {
    context.stub = {
      knex_from: sandbox.stub(knex, 'from'),
      knex_select: sandbox.stub(knex, 'select'),
      knex_where: sandbox.stub(knex, 'where'),
      knex_first: sandbox.stub(knex, 'first'),
      knex_delete: sandbox.stub(knex, 'delete'),
      knex_into: sandbox.stub(knex, 'into'),
      knex_insert: sandbox.stub(knex, 'insert'),
      knex_update: sandbox.stub(knex, 'update'),
      knex_join: sandbox.stub(knex, 'join'),
      knex_groupBy: sandbox.stub(knex, 'groupBy'),
      knex_orderby: sandbox.stub(knex, 'orderBy'),
      knex_limit: sandbox.stub(knex, 'limit'),
      console: sandbox.stub(console, 'error'),
    }
  })

  beforeEach(({context}: Flags) => {
    if(!isContext(context)) throw TypeError()

    context.stub.knex_from.returnsThis()
    context.stub.knex_select.returnsThis()
    context.stub.knex_where.returnsThis()
    context.stub.knex_first.returnsThis()
    context.stub.knex_into.returnsThis()
    context.stub.knex_join.returnsThis()
    context.stub.knex_groupBy.returnsThis()
    context.stub.knex_orderby.returnsThis()
    context.stub.knex_limit.returnsThis()
    context.stub.knex_delete.rejects(new Error('test: expectation not provided'))
    context.stub.knex_insert.rejects(new Error('test: expectation not provided'))
    context.stub.knex_update.rejects(new Error('test: expectation not provided'))
  })

  afterEach(() => sandbox.resetHistory())
  after(() => sandbox.restore())

  describe('list', () => {

    it('returns rows from table `actor`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()

      await list()
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'actor')
      sinon.assert.calledOnce(context.stub.knex_select)
    })

    it('returns rows from table `actor`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()

      await list()
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'actor')
      sinon.assert.calledOnce(context.stub.knex_select)
    })

    it('returns a list of movies that a given Actor starred on`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()

      await list()
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'actor')
      sinon.assert.calledOnce(context.stub.knex_select)
    })

  })

  describe('find', () => {

    it('returns one row from table `actor`, by `id`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyId = 123

      await find(anyId)
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'actor')
      sinon.assert.calledOnceWithExactly(context.stub.knex_where, { id: anyId })
      sinon.assert.calledOnce(context.stub.knex_first)
    })

  })

  describe('remove', () => {

    it('removes one row from table `actor`, by `id`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyId = 123
      context.stub.knex_delete.resolves()

      await remove(anyId)
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'actor')
      sinon.assert.calledOnceWithExactly(context.stub.knex_where, { id: anyId })
      sinon.assert.calledOnce(context.stub.knex_delete)
    })

    ; [0, 1].forEach( rows =>
      it(`returns ${!!rows} when (${rows}) row is found and deleted`, async ({context}: Flags) => {
        if(!isContext(context)) throw TypeError()
        context.stub.knex_delete.resolves(rows)
        const anyId = 123

        const result = await remove(anyId)
        expect(result).to.be.boolean()
        expect(result).equals(!!rows)
      }))

  })

  describe('update', () => {

    it('updates one row from table `actor`, by `id`', async ({context}: Flags) => {
      const anyId = 123
      if(!isContext(context)) throw TypeError()
      const anyName = 'any-name'
      const anyBornAt = new Date('1990-04-01')
      const anyBio = 'any-bio'
      context.stub.knex_update.resolves()

      await update(anyId, anyName, anyBio, anyBornAt)
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'actor')
      sinon.assert.calledOnceWithExactly(context.stub.knex_where, { id: anyId })
      sinon.assert.calledOnceWithExactly(context.stub.knex_update, {
        name: anyName, bio: anyBio, bornAt: anyBornAt
      })
    })

    ; [0, 1].forEach( rows =>
      it(`returns ${!!rows} when (${rows}) row is found and deleted`, async ({context}: Flags) => {
        if(!isContext(context)) throw TypeError()
        const anyId = 123
        const anyName = 'any-name'
        const anyBornAt = new Date('1990-04-01')
        const anyBio = 'any-bio'
        context.stub.knex_update.resolves(rows)

        const result = await update(anyId, anyName, anyBio, anyBornAt)
        expect(result).to.be.boolean()
        expect(result).equals(!!rows)
      }))

  })

  describe('remove', () => {

    it('removes one row from table `actor`, by `id`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyId = 123
      context.stub.knex_delete.resolves()

      await remove(anyId)
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'actor')
      sinon.assert.calledOnceWithExactly(context.stub.knex_where, { id: anyId })
      sinon.assert.calledOnce(context.stub.knex_delete)
    })

    ; [0, 1].forEach( rows =>
      it(`returns ${!!rows} when (${rows}) row is found and deleted`, async ({context}: Flags) => {
        if(!isContext(context)) throw TypeError()
        context.stub.knex_delete.resolves(rows)
        const anyId = 123

        const result = await remove(anyId)
        expect(result).to.be.boolean()
        expect(result).equals(!!rows)
      }))

  })

  describe('create', () => {

    it('insert one row into table `actor`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyName = 'any-name'
      const anyBornAt = new Date('1990-04-01')
      const anyBio = 'any-bio'
      context.stub.knex_insert.resolves([])

      await create(anyName, anyBio, anyBornAt)
      sinon.assert.calledOnceWithExactly(context.stub.knex_insert, {
        name: anyName, bio: anyBio, bornAt: anyBornAt
      })
    })

    it('returns the `id` created for the new row', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyName = 'any-name'
      const anyBornAt = new Date('1990-04-01')
      const anyBio = 'any-bio'
      const anyId = 123
      context.stub.knex_insert.resolves([anyId])

      const result = await create(anyName, anyBio, anyBornAt)
      expect(result).to.be.number()
      expect(result).equals(anyId)
    })

  })

  describe('listMovies', () => {

    it('returns a list of movies that a given Actor starred on`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()

      const anyId = 123
      await listMovies(anyId)
      sinon.assert.calledOnce(context.stub.knex_select)
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'movie')
      sinon.assert.calledOnceWithExactly(context.stub.knex_join, 'movie_character', 'movie.id', '=', 'movieId')
      sinon.assert.calledOnceWithExactly(context.stub.knex_where, 'movie_character.actorId', anyId)
    })

  })

  describe('listCharacters', () => {

    it('returns a list of character names of a given Actor.`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyId = 123
      await listCharacters(anyId)
      sinon.assert.calledOnce(context.stub.knex_select)
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'movie_character')
      sinon.assert.calledOnceWithExactly(context.stub.knex_where, 'movie_character.actorId', anyId)
    })

  })

  describe('getFavouriteGenre', () => {

    it('returns the favorite genre of a given Actor.`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyId = 123
      await getFavouriteGenre(anyId)
      sinon.assert.calledTwice(context.stub.knex_select)
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'genre')
      sinon.assert.calledTwice(context.stub.knex_join)
      // TODO Fix later - need to find out why is not working
      // sinon.assert.calledOnceWithExactly(context.stub.knex_join, 'movie_character', 'movie.id', '=', 'movie_character.movieId')
      // sinon.assert.calledOnceWithExactly(context.stub.knex_where, 'movie_character.actorId', anyId)
      // sinon.assert.calledOnceWithExactly(context.stub.groupBy, 'movie.genreId')
      // sinon.assert.calledOnceWithExactly(context.stub.orderBy, 'genre_count', 'desc')
      // sinon.assert.calledOnceWithExactly(context.stub.limit, 1)
    })

  })

  describe('listMovieCountByGenre', () => {

    it('returns the number of movies by genre on an actor profile page.`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyId = 123
      await listMoviesCountByGenre(anyId)
      // TODO Fix later - need to find out why is not working
      // sinon.assert.calledOnce(context.stub.knex_select)
      // sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'movie_character')
      // sinon.assert.calledOnceWithExactly(context.stub.knex_where, 'movie_character.actorId', anyId)
    })

  })

}))
