import mongoose from "mongoose"
import env from "@/config/envConf"

declare global {
  // Cache the database connection across serverless hot reloads
  var mongooseConnection: MongoService | undefined
}

export class MongoService {
    private isConnected = false

    public async connect() {
        if (this.isConnected) {
            console.log('Using cached database connection')
            return
        }

        try {
            console.log('Connecting to MongoDB...')
            const db = await mongoose.connect(env.MONGO_URI, {
                dbName: env.MONGO_DB_NAME,
            })

            this.isConnected = !!db.connections[0].readyState
            console.log('MongoDB connected successfully')

            mongoose.connection.on("error", (error) => {
                console.error('MongoDB connection error:', error instanceof Error ? error.message : error)
            })

            mongoose.connection.on("disconnected", () => {
                console.log('MongoDB disconnected')
            })
        } catch (error) {
            console.error("Error connecting to MongoDB:", error instanceof Error ? error.message : error)
            throw error
        }
    }
}

const db = global.mongooseConnection || new MongoService()

if (!global.mongooseConnection) {
    global.mongooseConnection = db
}

export default db