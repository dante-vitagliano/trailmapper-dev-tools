import { User } from "../entities/User";
import ORM from "../ORM";

export async function createUser(sub: string): Promise<User> {
    const user = new User();
    user.auth0id = sub;
    return await ORM.save<User>('User', user);
}

export async function getUser(sub: string): Promise<User | undefined> {
    try {
        return await ORM.findOne<User>('User', { auth0id: sub })
    } catch (e) {
        return undefined
    }
}