export default class Auth0Config {

    static AUTH0_PEM: string = (
        this.replaceAll(
        `<<YOUR CERTIFICATE HERE>>`
        ,"        ", "")
    )

    static AUTH0_JWT_CONFIG = {
        algorithms: "RS256"
    }

    static AUDIENCES_REQUIRED: string[] = ['<<YOUR AUTH0 AUDIENCE HERE>>']

    private static replaceAll(string, search, repl): string {
        while(string.includes(search)) {
            string = string.replace(search, repl)
        }
        return string
    }

}