import {
  ServerRoute,
  ResponseToolkit,
  Lifecycle,
  RouteOptionsValidate,
  Request,
  RouteOptionsResponseSchema
} from '@hapi/hapi'
import joi from 'joi'
import Boom from '@hapi/boom'

import * as movies from '../../lib/movies'

import { isHasCode } from '../../util/types'


interface ParamsId {
  id: number
}
const validateParamsId: RouteOptionsValidate = {
  params: joi.object({
    id: joi.number().required().min(1),
  })
}

interface PayloadMovie {
  name: string
  synopsis?: string
  releasedAt: Date
  runtime: number // minutes
  genreId: number // FK from genre
}
interface PayloadMovieCharacter {
  actorId: number
  name: string
}
const validatePayloadMovie: RouteOptionsResponseSchema = {
  payload: joi.object({
    name: joi.string().required(),
    releasedAt: joi.date().required(),
    runtime: joi.number().required(),
    genreId: joi.number().required(),
    synopsis: joi.string().optional()
  })
}

const validatePayloadMovieCharacter: RouteOptionsResponseSchema = {
  payload: joi.object({
    actorId: joi.number().required(),
    name: joi.string().required(),
  })
}

export const movieRoutes: ServerRoute[] = [{
  method: 'GET',
  path: '/movies',
  handler: getAll,
},{
  method: 'POST',
  path: '/movies',
  handler: post,
  options: { validate: validatePayloadMovie },
},{
  method: 'GET',
  path: '/movies/{id}',
  handler: get,
  options: { validate: validateParamsId },
},{
  method: 'PUT',
  path: '/movies/{id}',
  handler: put,
  options: { validate: {...validateParamsId, ...validatePayloadMovie} },
},{
  method: 'DELETE',
  path: '/movies/{id}',
  handler: remove,
  options: { validate: validateParamsId },
},{
  method: 'POST',
  path: '/movies/{id}/characters',
  handler: postCharacter,
  options: { validate: {...validateParamsId, ...validatePayloadMovieCharacter} },
},{
  method: 'DELETE',
  path: '/movies/{id}/characters/{actorId}',
  handler: removeCharacter,
  options: { validate: {...validateParamsId, ...validatePayloadMovieCharacter} },
},{
  method: 'GET',
  path: '/movies/{id}/characters',
  handler: getCharacters,
  options: { validate: {...validateParamsId } },
}]


async function getAll(_req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  return movies.list()
}

async function get(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  const found = await movies.find(id)
  return found || Boom.notFound()
}

async function post(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { name, releasedAt, runtime, genreId, synopsis } = (req.payload as PayloadMovie)

  try {
    const id = await movies.create(name, releasedAt, runtime, genreId, synopsis)
    const result = {
      id,
      path: `${req.route.path}/${id}`
    }
    return h.response(result).code(201)
  }
  catch(er: unknown){
    if(!isHasCode(er) || (er.code !== 'ER_DUP_ENTRY' && er.code !== 'ER_NO_REFERENCED_ROW_2')) throw er
    return Boom.conflict()
  }
}

async function put(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)
  const { name, releasedAt, runtime, genreId, synopsis } = (req.payload as PayloadMovie)
  try {
    return await movies.update(id, name, releasedAt, runtime, genreId, synopsis ) ? h.response().code(204) : Boom.notFound()
  }
  catch(er: unknown){
    if(!isHasCode(er) || er.code !== 'ER_DUP_ENTRY') throw er
    return Boom.conflict()
  }
}

async function remove(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)
  return await movies.remove(id) ? h.response().code(204) : Boom.notFound()
}

// TODO maybe use PUT method and internalize rule update or insert new movie character
async function postCharacter(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)
  const { actorId, name } = (req.payload as PayloadMovieCharacter)
  try {
    return await movies.addMovieCharacter(id, actorId, name) ? h.response().code(204) : Boom.notFound()
  }
  catch(er: unknown){
    if(!isHasCode(er) || er.code !== 'ER_DUP_ENTRY') throw er
    return Boom.conflict()
  }
}

// TODO decide whether if it should use actorId as a param for deletion, or if movie_character should have its own id
async function removeCharacter(_err?: Error): Promise<Lifecycle.ReturnValue> {
  // const { id } = (req.params as ParamsId)
  // return await movies.remove(id) ? h.response().code(204) : Boom.notFound()

  // Adding this for now to avoid lint error
  await Promise.all([])
  return Boom.notImplemented()
}

async function getCharacters(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)
  return movies.listMoviesCharacters(id)
}
