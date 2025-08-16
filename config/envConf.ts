const env = {
    APP_URL: String(process.env.APP_URL),
    JWT_SECRET: String(process.env.JWT_SECRET),
    MONGO_URI: String(process.env.MONGO_URI),
    MONGO_DB_NAME: String(process.env.MONGO_DB_NAME),
    SMTP_HOST: String(process.env.SMTP_HOST),
    SMTP_PORT: Number(process.env.SMTP_PORT),
    SMTP_USER: String(process.env.SMTP_USER),
    SMTP_PASSWORD: String(process.env.SMTP_PASSWORD),
    SMTP_FROM: String(process.env.SMTP_FROM),
    MINIO_ENDPOINT: String(process.env.MINIO_ENDPOINT),
    MINIO_ROOT_USER: String(process.env.MINIO_ROOT_USER),
    MINIO_ROOT_PASSWORD: String(process.env.MINIO_ROOT_PASSWORD),
    MINIO_BUCKET: String(process.env.MINIO_BUCKET),
    MINIO_REGION: String(process.env.MINIO_REGION),
}

export default env