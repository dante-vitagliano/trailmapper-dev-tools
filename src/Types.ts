export enum RequestType {
    GET, POST, PUT
}

export function requestTypeToString(requestType: RequestType): string {
    switch (requestType) {
        case RequestType.GET:
            return 'get'
        case RequestType.POST:
            return 'post'
        case RequestType.PUT:
            return 'put'
    }
}

export interface Dictionary<T> {
    [index: string]: T
}

export const formatSuccessResponse = (message: string, data: any, code: number = 200) => {
    return {
      statusCode: code,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type,Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: JSON.stringify({
        success: true,
        statusCode: code,
        message: message,
        data: data
      })
    }
  }
  
  export const errorResponse = async (code: number, error: string) => {
    return {
      statusCode: code,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: JSON.stringify({
        success: false,
        statusCode: code,
        message: error
      })
    }
  }

  export interface APIGatewayResponse {
    statusCode: number,
    headers: Dictionary<string>,
    body: string
}

export interface EventContext {
    type: RequestType,
    tokenParseResult: Auth0JwtVerificationResult,
    params: Dictionary<any>
}

export default interface Auth0JwtVerificationResult {
    iss: string | undefined,
    sub: string | undefined,
    aud: string[],
    iat: number,
    exp: number,
    azp: string | undefined,
    scope: string | undefined,
    permissions: string[]
}