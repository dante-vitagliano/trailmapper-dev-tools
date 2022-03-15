import { ConnectionManager, getConnectionManager, Connection, createConnection, EntityTarget, FindConditions } from "typeorm";
import { Dictionary } from "../Types";

export enum ORMMode {
    AURORA,
    CLASSIC
}

export default class ORM {

    private static AURORA_DBRegion = 'us-east-1'
    private static AURORA_DBSecretsStoreArn = process.env.DBSecretsStoreArn;
    private static AURORA_DBAuroraClusterArn = process.env.DBAuroraClusterArn;
    private static AURORA_DB_NAME = '<<YOUR DATABASE NAME>>'

    private static CLASSIC_HOST = ''
    private static CLASSIC_PORT = 3306
    private static CLASSIC_DATABASE = ''
    private static CLASSIC_USER = ''
    private static CLASSIC_PASSWORD = ''

    private static entities = [ ]

    private static connectionMode: ORMMode | undefined;
    private static connectionManager: ConnectionManager = getConnectionManager()

    public static setMode(mode: ORMMode) {
        // You may want to check that you don't do anything dangerous here
        // (Like switch modes during code execution)
        ORM.connectionMode = mode
    }

    public static getMode() {
        return ORM.connectionMode
    }

    public static async sync() {
        const connection = await this.connection()
        await connection.dropDatabase()
        await connection.synchronize()
    }

    public static async resetDatabase() {
        // You may want to check that this method is only called during
        // testing mode (i.e. not in production)
        const connection = await this.connection()
        await connection.dropDatabase()
        await connection.synchronize()
    }

     static async connection(): Promise<Connection> {

        if(this.connectionMode === undefined) {
            throw new Error(`ORM.connection() not supported when mode undefined`)
        }
        
        const CONNECTION_NAME = `default`
        let connection: Connection
        if (this.connectionManager.has(CONNECTION_NAME)) {
            connection = await this.connectionManager.get(CONNECTION_NAME)
            if (!connection.isConnected) {
                connection = await connection.connect()
            }
        }
        else {
            if(ORM.connectionMode === ORMMode.AURORA) {  
                connection = await createConnection({
                    type: 'aurora-data-api',
                    database: ORM.AURORA_DB_NAME,
                    secretArn: ORM.AURORA_DBSecretsStoreArn,
                    resourceArn: ORM.AURORA_DBAuroraClusterArn,
                    region: ORM.AURORA_DBRegion,
                    serviceConfigOptions: {},
                    formatOptions: {
                        castParameters: true
                    },
                    entities: ORM.entities,
                })
            } 
            else if (ORM.connectionMode === ORMMode.CLASSIC) {
                connection = await createConnection({
                    type: "mysql",
                    host: ORM.CLASSIC_HOST,
                    port: ORM.CLASSIC_PORT,
                    username: ORM.CLASSIC_USER,
                    password: ORM.CLASSIC_PASSWORD,
                    database: ORM.CLASSIC_DATABASE
                })
            }
            else {
                throw new Error("ORM Mode not recognized")
            }
        }

        return connection
    }

    // Mirror the methods on the ORM object itself
    public static async findOne<T>(entity: EntityTarget<T>, options: FindConditions<Dictionary<any>>): Promise<T> {
        const connection = await this.connection()
        return await connection.getRepository<T>(entity).findOne(options)
    }

    public static async findOneById<T>(entity: EntityTarget<T>, id: number): Promise<T> {
        const connection = await this.connection()
        return await connection.getRepository<T>(entity).findOne(id) as T
    }

    public static async find<T>(entity: EntityTarget<T>, options: FindConditions<Dictionary<any>>): Promise<T[]> {
        const connection = await this.connection()
        return await connection.getRepository<T>(entity).find(options) as T[]
    }

    public static async count<T>(entity: EntityTarget<T>, options: FindConditions<Dictionary<any>>): Promise<number> {
        const connection = await this.connection()
        return await connection.getRepository<T>(entity).count(options)
    }

    public static async save<T>(entity: EntityTarget<T>, document: T): Promise<T> {
        const connection = await this.connection()
        return await connection.getRepository<T>(entity).save(document) as T
    }

    public static async remove<T>(entity: EntityTarget<T>, document: T): Promise<T> {
        const connection = await this.connection()
        return await connection.getRepository<T>(entity).remove(document) as T
    }

    public static async close() {
        const connection = await this.connection()
        await connection.close()
    }

    public static async query(query: string): Promise<any> {
        const connection = await this.connection()
        return await connection.query(query)
    }

}