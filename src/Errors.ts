export default interface EndpointError {
    id: string,
    description: string,
    missingResources: string[],
    suggestedActions: string[]
}

export const makeEndpointError = (id: string, description: string, missingResources: string[], suggestedActions: string[]): EndpointError => {
    return {
        id: id,
        description: description,
        missingResources: missingResources,
        suggestedActions: suggestedActions
    }
}

export class EndpointErrors {
    static missingPermission(permission: string): EndpointError {
        return makeEndpointError(
            EndpointErrorCodes.PERMISSION_MISSING.code,
            EndpointErrorCodes.PERMISSION_MISSING.description(permission),
            [ permission ],
            EndpointErrorCodes.PERMISSION_MISSING.suggestedActions
        )
    }
    static missingRequiredParameter(param: string): EndpointError {
        return makeEndpointError(
            EndpointErrorCodes.REQUIRED_PARAMETER_MISSING.code,
            EndpointErrorCodes.REQUIRED_PARAMETER_MISSING.description(param),
            [ param ],
            EndpointErrorCodes.REQUIRED_PARAMETER_MISSING.suggestedActions
        )
    }
    static invalidParameterValue(param: string): EndpointError {
        return makeEndpointError(
            EndpointErrorCodes.PARAMETER_VALUE_INVALID.code,
            EndpointErrorCodes.PARAMETER_VALUE_INVALID.description(param),
            [ param ],
            EndpointErrorCodes.PARAMETER_VALUE_INVALID.suggestedActions
        )
    }
}

export default class EndpointErrorCodes {
    static PERMISSION_MISSING = {
        code: "permission_missing",
        description: (permission: string) => {
            return "The required parameter '" + permission + "' is not granted on this jwt bearer token"
        },
        suggestedActions: [
            "Make sure you are logged in with the right account. If you are, reach out to brendan to have him grant you permission"
        ]
    }
    static REQUIRED_PARAMETER_MISSING = {
        code: "required_parameter_missing",
        description: (param: string) => {
            return "The required parameter '" + param + "' is missing"
        },
        suggestedActions: [
            "Make sure the URL you are visiting is valid. (Send a screenshot of the page and the URL to brendan)"
        ]
    }
    static PARAMETER_VALUE_INVALID = {
        code: "parameter_value_invalid",
        description: (param: string) => {
            return "The parameter '" + param + "' is invalid (explanations not yet supported)"
        },
        suggestedActions: [
            "Make sure the URL you are visiting is valid. (Send a screenshot of the page and the URL to brendan)"
        ]
    }
}