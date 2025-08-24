import env from "@/config/envConf"
import Dexie, { type EntityTable } from "dexie"

interface IDBUser {
    _id: string
    name: string
    email: string
    bio: string
    dp: string | null
    verified: boolean
    connections: string[]
    createdAt: Date
    updatedAt: Date
}

export class IndexedDBService {
    db: Dexie

    constructor() {
        this.db = new Dexie(env.INDEXED_DB_NAME) as Dexie & {
            user: EntityTable<IDBUser, '_id'>
        }
        this.db.version(env.INDEXED_DB_VERSION).stores({
            user: "_id, name, email, bio, dp, verified, connections, createdAt, updatedAt",
        })
    }
}

const indexedDBService = new IndexedDBService()
export default indexedDBService
export type { IDBUser }