import env from "@/config/envConf"
import Dexie from "dexie"

export class IndexedDBService {
    db: Dexie

    constructor() {
        this.db = new Dexie(env.INDEXED_DB_NAME)
        this.db.version(env.INDEXED_DB_VERSION).stores({
            user: "_id, "
        })
    }
}
const indexedDBService = new IndexedDBService()
export default indexedDBService