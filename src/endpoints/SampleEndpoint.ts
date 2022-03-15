import { StatusCodes } from 'http-status-codes';
import Endpoint from 'src/Endpoint';
import { middyfy } from 'src/Handlers';
import { User } from 'src/orm/entities/User';
import { APIGatewayResponse, Dictionary, formatSuccessResponse, RequestType } from 'src/Types';

interface XXXXEndpointParams {
    resouce: Dictionary<any>
}

export default class XXXXEndpoint extends Endpoint<XXXXEndpointParams> {
    
    name: string = 'XXXXEndpoint'
    path: string = '/x/y/z'
    type: RequestType = RequestType.GET // or .POST

    async run(_: { type: RequestType; event: any; params: XXXXEndpointParams; user: User }): Promise<APIGatewayResponse> {
        
        // Do some work here

        return formatSuccessResponse(
            "This is my successful message",
            { hello: 123 }, // your data as JSON here
            StatusCodes.OK
        )
    }
    
    requiredPermissions(): string[] {
        return [ 'create:XXXX', 'view:YYYY' ] // define these in Auth0
    }

    async requiredParameters(): Promise<string[]> {
        return [ 'count' ]
    }
    override mappers = {
        'resource': async (value: any) => {
            let id = value as number

            // Use a database call to convert the resouce id to an ORM object
            // let val = await getResouceById(id)

            // Pretend that's the ORM object
            // return val
            return {}
        }
    }
    async validateParameter(key: string, value: any): Promise<boolean> {
        if (key === 'resouce') {
            return value !== null && value !== undefined && value !== false
        }
        return false
    }

}

// Register the endpoint
export const XXXXEndpointInstance = new XXXXEndpoint()
export const handler = middyfy(async (event) => {
    return await XXXXEndpointInstance.getLambdaImplementation(event)
})