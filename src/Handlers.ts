import Endpoints from "./Endpoints"
import { requestTypeToString } from "./Types"
import middy from "@middy/core"
import middyJsonBodyParser from "@middy/http-json-body-parser"
import type { AWS } from '@serverless/typescript';

function generateHandlerExports(): AWS["functions"] {
    let handlers = {}
    Endpoints.all.forEach(endpoint => {
        handlers[endpoint.getName()] = {
            'handler': `src/endpoints${endpoint.getPath()}.handler`,
            'events': [
              {
                http: {
                  method: requestTypeToString(endpoint.getType()),
                  path: endpoint.getPath(),
                  cors: true,
                  request: {
                    schema: {
                      'application/json': {}
                    }
                  }
                }
              }
            ]
        }
    })
    return handlers
}

export const Handlers = generateHandlerExports()

export const middyfy = (handler) => {
  return middy(handler).use(middyJsonBodyParser())
}
