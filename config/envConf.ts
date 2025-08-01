
const env = {
    JWT_SECRET: String(process.env.JWT_SECRET),
    MONGO_URI: String(process.env.MONGO_URI),
    MONGO_DB_NAME: String(process.env.MONGO_DB_NAME),
    CLOUD_NAME: String(process.env.CLOUD_NAME),
    API_KEY: String(process.env.API_KEY),
    API_SECRET: String(process.env.API_SECRET),
    SMTP_HOST: String(process.env.SMTP_HOST),
    SMTP_PORT: Number(process.env.SMTP_PORT),
    SMTP_USER: String(process.env.SMTP_USER),
    SMTP_PASSWORD: String(process.env.SMTP_PASSWORD),
    SMTP_FROM: String(process.env.SMTP_FROM),
}

export default env;
