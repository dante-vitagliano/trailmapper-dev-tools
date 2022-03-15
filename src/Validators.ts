import Auth0Config from "./Auth0";
import Endpoint from "./Endpoint";
import EndpointError, { EndpointErrors } from "./Errors";
import Auth0JwtVerificationResult, { Dictionary, EventContext, RequestType } from "./Types";

const jwt = require('jsonwebtoken');

export default class Validators<Type> {

    static async fromEvent<Type>(endpoint: Endpoint<Type>, requestType: RequestType, event: any): Promise<Validators<Type>> {
        
      // Convert the event object to a more friendly context object
      const context = ValidatorHelpers.getEventContext(requestType, event)

      // Apply any parameter mappers that might be specified
      for(let parameter of Object.keys(context.params)) {
        if(endpoint.mappers[parameter]) {
          context.params[parameter] = await endpoint.mappers[parameter](context.params[parameter])
        }
      }

      // Run the validators (for authentication, parameter validity, etc.)
      return Validators.fromParams(endpoint, context.params, context.tokenParseResult)
    }

    static fromParams<Type>(endpoint: Endpoint<Type>, params: Dictionary<any>, auth: Auth0JwtVerificationResult): Validators<Type> {
        return new Validators(endpoint, params, auth)
    }

    private endpoint: Endpoint<Type>;
    private params: Dictionary<any>;
    private auth: Auth0JwtVerificationResult;
    constructor(endpoint: Endpoint<Type>, params: Dictionary<any>, auth: Auth0JwtVerificationResult) {
        this.endpoint = endpoint
        this.params = params
        this.auth = auth
    }

    // Check that all the permissions are present
    // Note: These checks are performed in order
    private getMissingPermissions = async (): Promise<string[]> => {
      const requiredPermissions = await this.endpoint.requiredPermissions()
      ////T:console.log(`Required permissions: ${requiredPermissions}`)
      const missing = requiredPermissions.filter(permission => {
        return !this.getPermissions().includes(permission)
      })
      ////T:console.log(`Missing permissions: ${missing}`)
      return missing
    }
    allPermissionsRequiredObtained = async (): Promise<boolean> => {
      const missingPermissions = await this.getMissingPermissions()
      return missingPermissions.length === 0
    }

    // Check that all the values are okay
    // Note: These checks are performed in order
    private getMissingRequiredParameters = async (): Promise<string[]> => {
      const requiredParams = await this.endpoint.requiredParameters()
      return requiredParams.filter(parameter => {
        return !Object.keys(this.params).includes(parameter)
      })
    }
    allRequiredParametersPresent = async (): Promise<boolean> => {
      const missingRequiredParameters = await this.getMissingRequiredParameters()
      return missingRequiredParameters.length === 0
    }

    // Check that all parameters are okay, including optional ones
    // Note: These checks are performed in order.
    private getInvalidParameters = async (): Promise<string[]> => {
      let invalid = []
      for(let parameter of Object.keys(this.params)) {
        //T:console.log("Validating parameter: " + parameter + " ...")
        let parameter_value = this.params[parameter]
        const valid = await this.endpoint.validateParameter(parameter, parameter_value)
        if(!valid) {
          invalid.push(parameter)
        }
      }
      return invalid
    }
    allParametersValid = async (): Promise<boolean> => {
      const invalidParams = await this.getInvalidParameters()
      return invalidParams.length === 0
    }

    /**
     * Validates (1) that the user has all the required permissions, (2) that all the required parameters are present,
     * and (3) that all the parameters are valid.
     * Note: These checks are performed in parallel.
     * @returns true if all the checks pass, false otherwise
     */
    async allValid(): Promise<boolean> {

      const [
        hasAllPermissions,
        hasAllRequiredParameters,
        areAllParametersValid
      ] = [
        await this.allPermissionsRequiredObtained(),
        await this.allRequiredParametersPresent(),
        await this.allParametersValid()
      ]

      return hasAllPermissions && hasAllRequiredParameters && areAllParametersValid

    }

    // Describe all the errors the user encountered
    // Note: This requires all the validations again
    // Note: These checks are performed in parallel
    async getErrors(): Promise<EndpointError[]> {
      let errors = []

      const [
        missingPermissions,
        missingParameters,
        invalidParameters
      ] = [
        await this.getMissingPermissions(),
        await this.getMissingRequiredParameters(),
        await this.getInvalidParameters()
      ]

      for(let missingPermission of missingPermissions) {
        errors.push(EndpointErrors.missingPermission(missingPermission))
      }
      for(let missingParameter of missingParameters) {
        errors.push(EndpointErrors.missingRequiredParameter(missingParameter))
      }
      for(let invalidParameter of invalidParameters) {
        errors.push(EndpointErrors.invalidParameterValue(invalidParameter))
      }

      return errors
    }

    getParams(): Dictionary<any> {
      return this.params
    }

    getUserSub(): string {
      return this.auth.sub
    }

    private getPermissions(): string[] {
      if(this.auth) {
        return this.auth.permissions
      } else {
        return []
      }
    }

}

export class ValidatorHelpers {

  static getEventContext(requestType: RequestType, event: any): EventContext {
    
      const token = ValidatorHelpers.getBearerToken(event)
      const tokenParseResult = ValidatorHelpers.getTokenParseResult(token)
    
      // Get the params based on the request type
      const params: Dictionary<any> = (
        (requestType === RequestType.GET) 
          ? event.queryStringParameters
          : event.body
      ) ?? {}
    
      return {
        type: requestType,
        params: params,
        tokenParseResult: tokenParseResult
      }
  }
  
  static getBearerToken(event: any): string | undefined {
    try {
      if(event.headers['authorization'] !== undefined) {
        return event.headers['authorization'].split("Bearer ")[1]
      }
      if(event.headers['Authorization'] !== undefined) {
        return event.headers['Authorization'].split("Bearer ")[1]
      }
      throw new Error("Neither authorization header type worked")
    } catch (e) {
      return undefined
    }
  }

  static getTokenParseResult(token: string): Auth0JwtVerificationResult | undefined {
    return (
      token !== undefined 
      ?
        jwt.verify(
          token,
          Auth0Config.AUTH0_PEM,
          Auth0Config.AUTH0_JWT_CONFIG
        )
      :
        undefined
    )
  }
}