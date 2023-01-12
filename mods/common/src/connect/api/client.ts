/*
 * Copyright (C) 2022 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/routr
 *
 * This file is part of Routr
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable require-jsdoc */
import * as grpc from "@grpc/grpc-js"
import { JsonObject, struct } from "pb-util"
import { ServiceUnavailableError } from "../../errors"
import { createClient } from "../grpc_client"
import { Kind } from "../types"
import {
  APIClient,
  DataAPIOptions,
  FindByRequest,
  FindByResponse,
  ListRequest,
  ListResponse,
  ServiceAPI,
  ServiceAPIOptions
} from "./types"

type GrpcError = { code: number }

function fire(err: GrpcError, apiAddr: string) {
  if (err.code === grpc.status.UNAVAILABLE) {
    return new ServiceUnavailableError(
      `api server at ${apiAddr} is unavailable`
    )
  }
  return err
}

export function apiClient(options: DataAPIOptions): APIClient {
  const { apiAddr, credentials } = options

  return {
    agents: serviceAPI({ kind: Kind.AGENT, apiAddr, credentials }),
    domains: serviceAPI({ kind: Kind.DOMAIN, apiAddr, credentials }),
    trunks: serviceAPI({ kind: Kind.TRUNK, apiAddr, credentials }),
    credentials: serviceAPI({ kind: Kind.CREDENTIALS, apiAddr, credentials }),
    acl: serviceAPI({ kind: Kind.AGENT, apiAddr, credentials }),
    peers: serviceAPI({ kind: Kind.PEER, apiAddr, credentials }),
    numbers: serviceAPI({ kind: Kind.NUMBER, apiAddr, credentials })
  }
}

export function serviceAPI<R>(options: ServiceAPIOptions): ServiceAPI<R> {
  const { kind, apiAddr, credentials } = options

  const client = createClient({
    kind,
    apiAddr,
    credentials: credentials ?? grpc.credentials.createInsecure()
  })

  return {
    create: <R extends { extended?: JsonObject }>(request: JsonObject) =>
      new Promise<R>((resolve, reject) => {
        if (request.extended) {
          request.extended = struct.encode(
            request.extended as JsonObject
          ) as JsonObject
        }

        client.create(request, (err: GrpcError, response: R) => {
          if (err) {
            return reject(fire(err, apiAddr))
          }

          if (response.extended) {
            response.extended = struct.decode(response.extended)
          }

          resolve(response)
        })
      }),

    update: <R extends { extended?: JsonObject }>(request: JsonObject) =>
      new Promise<R>((resolve, reject) => {
        if (request.extended) {
          request.extended = struct.encode(
            request.extended as JsonObject
          ) as JsonObject
        }

        client.update(request, (err: GrpcError, response: R) => {
          if (err) {
            return reject(fire(err, apiAddr))
          }

          if (response.extended) {
            response.extended = struct.decode(response.extended)
          }

          resolve(response)
        })
      }),

    get: <R extends { extended?: JsonObject }>(ref: string) =>
      new Promise<R>((resolve, reject) => {
        client.get({ ref }, (err: GrpcError, response: R) => {
          if (err) {
            return reject(fire(err, apiAddr))
          }

          if (response.extended) {
            response.extended = struct.decode(response.extended)
          }

          resolve(response)
        })
      }),

    list: <R extends { extended?: JsonObject }>(request: ListRequest) =>
      new Promise<ListResponse<R>>((resolve, reject) => {
        client.list(request, (err: GrpcError, response: ListResponse<R>) => {
          if (err) {
            return reject(fire(err, apiAddr))
          }

          response.items.forEach((item: { extended?: JsonObject }) => {
            if (item.extended) {
              item.extended = struct.decode(item.extended)
            }
          })

          resolve({
            items: response?.items ?? [],
            nextPageToken: response.nextPageToken
          })
        })
      }),

    findBy: <R>(request: FindByRequest) =>
      new Promise<FindByResponse<R>>((resolve, reject) => {
        client.findBy(
          request,
          (err: GrpcError, response: FindByResponse<R>) => {
            if (err) {
              return reject(fire(err, apiAddr))
            }

            response.items.forEach((item: { extended?: JsonObject }) => {
              if (item.extended) {
                item.extended = struct.decode(item.extended)
              }
            })

            resolve(response)
          }
        )
      }),

    del: (ref: string) =>
      new Promise((resolve, reject) => {
        client.get({ ref }, (err: GrpcError) =>
          err ? reject(fire(err, apiAddr)) : resolve()
        )
      })
  }
}