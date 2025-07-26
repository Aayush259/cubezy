import env from "@/config/envConf"
import { jwtVerify, SignJWT } from "jose"

export class JoseService {
    private secret

    constructor() {
        this.secret = new TextEncoder().encode(env.JWT_SECRET)
    }

    protected async signToken(payload: Record<string, any>) {
        return await new SignJWT(payload) // this only works if payload is flat and doesn't contain reserved claims
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1d')
            .sign(this.secret)
    }

    async verifyToken(token: string) {
        try {
            const { payload } = await jwtVerify(token, this.secret)
            return payload
        } catch (error) {
            console.error("JWT verification failed:", error)
            return null
        }
    }
}

const joseService = new JoseService()
export default joseService