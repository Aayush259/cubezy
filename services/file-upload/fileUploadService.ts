import crypto from "node:crypto"
import { fileTypeFromBuffer } from "file-type"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import env from "@/config/envConf"

class FileUploadService {
    private allowedMimeTypes = [
        // Images
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/tiff",
        // Audio
        "audio/mpeg", "audio/wav", "audio/ogg", "audio/webm",
        // Video
        "video/mp4", "video/webm", "video/ogg",
        // Documents
        "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/plain"
    ]

    private s3 = new S3Client({
        region: env.MINIO_REGION,
        endpoint: env.MINIO_ENDPOINT,
        credentials: {
            accessKeyId: env.MINIO_ROOT_USER,
            secretAccessKey: env.MINIO_ROOT_PASSWORD,
        },
        forcePathStyle: true,
    })

    async upload({ file, location }: { file: Buffer, location?: string }) {
        try {
            if (!file) throw new Error("No file provided")

            // Detect file tye from buffer
            const detectedType = await fileTypeFromBuffer(file)
            if (!detectedType) {
                throw new Error("Unable to detect file type")
            }

            // Security check: allow only known safe MIME types
            if (!this.allowedMimeTypes.includes(detectedType.mime)) {
                throw new Error("File type not allowed: " + detectedType.mime)
            }

            // Generate unique file name with correct extension
            const uniqueName = `${crypto.randomUUID()}.${detectedType.ext}`
            const key = location ? `${location}/${uniqueName}` : uniqueName

            // Upload to MinIO
            await this.s3.send(new PutObjectCommand({
                Bucket: env.MINIO_BUCKET,
                Key: key,
                Body: file,
                ACL: "public-read", // makes the object publicly accessible
                ContentType: detectedType.mime
            }))

            // Return the public URL
            return `/uploads/${key}`

            // Create the upload directory if it doesn't exist
            // const uploadPath = location ? `uploads/${location}` : "uploads"
            // const uploadDir = path.join(process.cwd(), "public", uploadPath)

            // try {
            //     await fs.access(uploadDir)
            // } catch (error) {
            //     await fs.mkdir(uploadDir, { recursive: true })
            // }

            // // Generate unique file name with correct extension
            // const uniqueName = `${crypto.randomUUID()}.${detectedType.ext}`
            // const filePath = path.join(uploadDir, uniqueName)

            // await fs.writeFile(filePath, file)
            // return `/${uploadPath}/${uniqueName}`
        } catch (error) {
            console.log("Error uploading file:", error)
            throw error
        }
    }
}

const fileUploadService = new FileUploadService()
export default fileUploadService