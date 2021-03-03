import { script } from '@hapi/lab'
import { expect } from '@hapi/code'
import sinon from 'sinon'

export const lab = script()
const { beforeEach, before, after, afterEach, describe, it } = lab

import * as Hapi from '@hapi/hapi'
import { actor as plugin } from './index'
import * as lib from '../../lib/actors'

describe('plugin', () => describe('actor', () => {
  const sandbox = Object.freeze(sinon.createSandbox())

  const isContext = (value: unknown): value is Context => {
    if(!value || typeof value !== 'object') return false
    const safe = value as Partial<Context>
    if(!safe.server) return false
    if(!safe.stub) return false
    return true
  }
  interface Context {
    server: Hapi.Server
    stub: Record<string, sinon.SinonStub>
  }
  interface Flags extends script.Flags {
    readonly context: Partial<Context>
  }

  before(async ({ context }: Flags) => {
    context.stub = {
      lib_list: sandbox.stub(lib, 'list'),
      lib_find: sandbox.stub(lib, 'find'),
      lib_remove: sandbox.stub(lib, 'remove'),
      lib_create: sandbox.stub(lib, 'create'),
      lib_update: sandbox.stub(lib, 'update'),
      lib_listMovies: sandbox.stub(lib, 'listMovies'),
      lib_listCharacters: sandbox.stub(lib, 'listCharacters'),
      lib_getFavouriteGenre: sandbox.stub(lib, 'getFavouriteGenre'),
      lib_listMoviesCountByGenre: sandbox.stub(lib, 'listMoviesCountByGenre'),

    }

    // all stubs must be made before server starts
    const server = Hapi.server()
    await server.register(plugin)
    await server.start()
    context.server = server
  })

  beforeEach(({ context }: Flags) => {
    if(!isContext(context)) throw TypeError()

    context.stub.lib_list.rejects(new Error('test: provide a mock for the result'))
    context.stub.lib_find.rejects(new Error('test: provide a mock for the result'))
    context.stub.lib_remove.rejects(new Error('test: provide a mock for the result'))
    context.stub.lib_create.rejects(new Error('test: provide a mock for the result'))
    context.stub.lib_update.rejects(new Error('test: provide a mock for the result'))
  })

  afterEach(() => sandbox.resetHistory())
  after(() => sandbox.restore())

  describe('GET /actors', () => {
    const [method, url] = ['GET', '/actors']

    it('returns all actors', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      const anyResult = [{'any': 'result'}]
      context.stub.lib_list.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(200)

      sinon.assert.calledOnce(context.stub.lib_list)
      expect(response.result).equals(anyResult)
    })

  })

  describe('POST /actors', () => {
    const [method, url] = ['POST', '/actors']

    it('validates payload is not empty', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const payload = undefined
      const opts: Hapi.ServerInjectOptions = { method, url, payload}

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('validates payload matches `actor`', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const payload = {'some': 'object'}
      const opts: Hapi.ServerInjectOptions = { method, url, payload}

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('returns HTTP 409 when given `name` already exists', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const payload = {
        'name': 'repeated-name', 'bornAt': new Date('1990-04-01'), 'bio': 'test bio blablabla'
      }
      const opts: Hapi.ServerInjectOptions = { method, url, payload }
      context.stub.lib_create.rejects({ code: 'ER_DUP_ENTRY'})

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(409)
    })

    it('returns HTTP 201, with the `id` and `path` to the row created', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const payload = {
        'name': 'repeated-name', 'bornAt': new Date('1990-04-01'), 'bio': 'test bio blablabla'
      }
      const opts: Hapi.ServerInjectOptions = { method, url, payload }
      const anyResult = 123
      context.stub.lib_create.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(201)

      sinon.assert.calledOnceWithExactly(context.stub.lib_create, payload.name, payload.bio, payload.bornAt)
      expect(response.result).equals({
        id: anyResult,
        path: `/actors/${anyResult}`
      })
    })

  })

  describe('GET /actors/:id', () => {
    const paramId = 123
    const [method, url] = ['GET', `/actors/${paramId}`]

    it('validates :id is numeric', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url: 'not-a-number' }

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('returns HTTP 404 when :id is not found', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      context.stub.lib_find.resolves(null)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(404)
    })

    it('returns one actor', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      const anyResult = {'any': 'result'}
      context.stub.lib_find.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(200)

      sinon.assert.calledOnceWithExactly(context.stub.lib_find, paramId)
      expect(response.result).equals(anyResult)
    })

  })

  describe('PUT /actors/:id', () => {
    const paramId = 123
    const [method, url, payload] = [
      'PUT',
      `/actors/${paramId}`,
      {
        'name': 'any-name',
        'bornAt': new Date('1990-04-01'),
        'bio': 'test bio blablabla'
      }
    ]

    it('validates payload is not empty', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url, payload: undefined}

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('validates payload matches `actor`', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url, payload: {'unexpected': 'object'}}

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('returns HTTP 404 when :id is not found', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url, payload }
      context.stub.lib_update.resolves(0)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(404)
    })

    it('returns HTTP 409 when given `name` already exists', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url, payload }
      context.stub.lib_update.rejects({ code: 'ER_DUP_ENTRY'})

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(409)
    })

    it('returns HTTP 204', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url, payload }
      const anyResult = 123
      context.stub.lib_update.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(204)

      // sinon.assert.calledOnceWithExactly(context.stub.lib_update, paramId, payload.name, payload.releasedAt, payload.runtime, payload.genreId, payload.synopsis)
      // expect(response.result).to.be.null()
    })

  })

  describe('DELETE /actors/:id', () => {
    const paramId = 123
    const [method, url] = ['DELETE', `/actors/${paramId}`]

    it('validates :id is numeric', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url: 'not-a-number' }

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('returns HTTP 404 when :id is not found', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      context.stub.lib_remove.resolves(0)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(404)
    })

    it('returns HTTP 204', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      const anyResult = {'any': 'result'}
      context.stub.lib_remove.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(204)

      sinon.assert.calledOnceWithExactly(context.stub.lib_remove, paramId)
      expect(response.result).to.be.null()
    })

  })

  describe('GET /actors/:id/movies', () => {
    const paramId = 1
    const [method, url] = ['GET', `/actors/${paramId}/movies`]

    it('validates :id is numeric', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url: 'invalid' }

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('returns a list of movies that a given Actor starred on.', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      const anyResult = [
        {
          'id': 1,
          'name': 'The return of those who were never gone',
          'synopsis': '...',
          'releasedAt': '1996-04-01',
          'runtime': 90,
          'genreId': 1
        }
      ]
      context.stub.lib_listMovies.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(200)

      sinon.assert.calledOnce(context.stub.lib_listMovies)
      expect(response.result).equals(anyResult)
    })
  })

  describe('GET /actors/:id/characters', () => {
    const actorId = 1
    const [method, url] = ['GET', `/actors/${actorId}/characters`]

    it('validates :id is numeric', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url: 'invalid' }

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('returns a  list of character names of a given Actor.', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      const anyResult = [
        'Gandalf',
        'Magneto'
      ]
      context.stub.lib_listCharacters.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(200)

      sinon.assert.calledOnce(context.stub.lib_listCharacters)
      expect(response.result).equals(anyResult)
    })
  })

  describe('GET /actors/:id/favourite-genre', () => {
    const actorId = 1
    const [method, url] = ['GET', `/actors/${actorId}/favourite-genre`]

    it('returns the favorite genre of a given Actor.', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      // TODO improve test requirements
      const anyResult = [{}]
      context.stub.lib_getFavouriteGenre.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(200)

      sinon.assert.calledOnce(context.stub.lib_getFavouriteGenre)
      expect(response.result).equals(anyResult)
    })
  })

  describe('GET /actors/:id/movies-by-genre', () => {
    const actorId = 1
    const [method, url] = ['GET', `/actors/${actorId}/movies-by-genre`]

    it('returns the number of movies by genre on an actor profile page.', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      // TODO improve test requirements
      const anyResult = [{}]
      context.stub.lib_listMoviesCountByGenre.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(200)

      sinon.assert.calledOnce(context.stub.lib_listMoviesCountByGenre)
      expect(response.result).equals(anyResult)
    })
  })

}))
