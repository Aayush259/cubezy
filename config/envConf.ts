
const env = {
    JWT_SECRET: String(process.env.JWT_SECRET),
    MONGO_URI: String(process.env.MONGO_URI),
    MONGO_DB_NAME: String(process.env.MONGO_DB_NAME),
    CLOUD_NAME: String(process.env.CLOUD_NAME),
    API_KEY: String(process.env.API_KEY),
    API_SECRET: String(process.env.API_SECRET),
}

export default env;
