import env from "@/config/envConf"
import cloudinary from 'cloudinary'
import { Readable } from "node:stream"

class FileUploadService {
    private cloudName
    private apiKey
    private apiSecret

    constructor() {
        this.cloudName = env.CLOUD_NAME
        this.apiKey = env.API_KEY
        this.apiSecret = env.API_SECRET

        cloudinary.v2.config({
            cloud_name: this.cloudName,
            api_key: this.apiKey,
            api_secret: this.apiSecret,
            secure: true,
        })
    }

    async upload({ file }: { file: Buffer }) {
        try {
            if (!file) throw new Error("No file provided")

            // Convert the file buffer to a Readable stream
            const stream = Readable.from(file)

            // Upload image to Cloudinary
            const uploadUrl = await new Promise<string>((resolve, reject) => {
                const uploadStream = cloudinary.v2.uploader.upload_stream(
                    { folder: "Cubezy" },
                    async (error, result) => {
                        if (error) {
                            console.log("Cloudinary upload error:", error)
                            reject(new Error("Cloudinary upload error:"))
                        } else {
                            resolve(result?.secure_url as string)
                        }
                    }
                )

                stream.pipe(uploadStream)
            })

            return uploadUrl
        } catch (error) {
            console.log("Error uploading file:", error)
            throw error
        }
    }
}

const fileUploadService = new FileUploadService()
export default fileUploadService