import ORM, { ORMMode } from "./orm/ORM";
import { APIGatewayResponse, Dictionary, RequestType } from "./Types";
import { StatusCodes } from "http-status-codes";
import { User } from "src/orm/entities/User";
import { createUser } from "./User";
import Validators from "./Validators";


export interface EndpointContext {
    type: RequestType,
    event: any,
    params: Dictionary<any>,
    user: User
}

export interface IEndpointConstructor {
    new (mode: ORMMode): any;
}

export default abstract class Endpoint<Type> {

    abstract name: string;
    abstract path: string
    abstract type: RequestType;

    private mode: ORMMode

    constructor(mode: ORMMode = ORMMode.AURORA) {
        this.mode = mode
    }

    public getName(): string {
        return this.name
    }

    public getPath(): string {
        return this.path
    }

    public getType(): RequestType {
        return this.type
    }

    abstract requiredPermissions(): string[]
    abstract requiredParameters(): Promise<string[]>
    abstract validateParameter(key: string, value: any): Promise<boolean>
    
    /**
     * Orverride this method to convert items from
     * the original format in the body/query params
     * into what you actually want passed into your
     * interface.
     * @param key params key
     * @param value params value as an any
     * @returns the value in whatever type you want
     */
    mappers: {[index: string]: (value: any) => Promise<any>} = {}

    abstract run(context: {
        type: RequestType,
        event: any,
        params: Type,
        user: User
    }): Promise<APIGatewayResponse>

    async getLambdaImplementation(e: any): Promise<APIGatewayResponse> {

        let event = JSON.parse(JSON.stringify(e))
        let resp: any = undefined

        try {
            console.log("Trying to get a response")
            ORM.setMode(this.mode)
            resp = await this._implementation(event)
            console.dir(resp)
        } catch (e) {
            console.error(e)
        } finally {
            await ORM.close()
            return resp
        }
    }

    private async _implementation(event: any) {
        const endpointStatus = await Validators.fromEvent(this, this.type, event)
        const errors = await endpointStatus.getErrors()

            if(!await endpointStatus.allPermissionsRequiredObtained()) {
                return errorResponseWithHelp(
                    StatusCodes.FORBIDDEN,
                    "Your are missing some of the required permissions. Please see the attatched help information.",
                    errors
                )
            }

            if(!await endpointStatus.allRequiredParametersPresent()) {
                return errorResponseWithHelp(
                    StatusCodes.BAD_REQUEST,
                    "You failed to include some required input parameters. Please see the attatched help information.",
                    errors
                )
            }

            if(!await endpointStatus.allParametersValid()) {
                return errorResponseWithHelp(
                    StatusCodes.BAD_REQUEST,
                    "Your input parameters are invalid. Please see the attatched help information.",
                    errors
                )
            }

            // If there isn't a user account created for this sub yet, we need to create one
            // .......
            // .......
            const user_id: string = endpointStatus.getUserSub()
            console.log("\nuser sub is " + user_id)
            let user = await ORM.findOne<User>('User', { auth0id: user_id })
            console.dir(user)
            if(!user) {
                user = await createUser(user_id)
            }

            let params: Type | undefined = undefined
            try {
                params = endpointStatus.getParams() as Type
            } catch (e){
                return errorResponseWithHelp(
                    500,
                    "There was an error processing your request. The interface conversion failed",
                    []
                )
            }
            
            return await this.run({
                type: this.type,
                event: event,
                params: params,
                user: user as User
            })
    }

}

function errorResponseWithHelp(FORBIDDEN: any, arg1: string, errors: any) {
    throw new Error("Function not implemented.");
}
