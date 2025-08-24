import api from "@/lib/axios"
import { IUser } from "@/services/database/userService"
import { IChatMessage, IConnection, ILastMessage } from "@/lib/interfaces"

class Requests {
    async getMe(): Promise<IUser> {
        try {
            if (!localStorage.getItem("token")) {
                throw new Error("No token found")
            }
            const { data } = await api.get("/auth/me")
            console.log("Request service => getMe: ", data)

            if (data?.user) {
                return data.user
            } else {
                throw new Error("Something went wrong", { cause: data })
            }
        } catch (error) {
            throw error
        }
    }

    async login({ email, password, captchaToken }: { email: string, password: string, captchaToken: string }): Promise<{ redirect: string } | IUser> {
        try {
            const { data } = await api.post("/auth/login", { email, password, captchaToken })
            console.log("Request service => login: ", data)

            if (data?.user && data?.token) {
                localStorage.setItem("token", data.token)
                return data.user
            } else if (data?.data?.redirect) {
                return { redirect: data.data.redirect }
            } else {
                localStorage.removeItem("token")
                throw new Error("Something went wrong", { cause: data })
            }
        } catch (error) {
            throw error
        }
    }

    async signup({ name, email, password, captchaToken }: { name: string, email: string, password: string, captchaToken: string }): Promise<{ redirect: string }> {
        try {
            const { data } = await api.post("/auth/signup", { name, email, password, captchaToken })
            console.log("Request service => signup: ", data)

            if (data?.data?.redirect) {
                return { redirect: data.data.redirect }
            } else {
                throw new Error("Something went wrong", { cause: data })
            }
        } catch (error) {
            throw error
        }
    }

    async verifyOTP({ email, otp, password }: { email: string, otp: string, password: string }): Promise<IUser> {
        try {
            const { data } = await api.post("/auth/verify", { email, otp, password })
            console.log("Request service => verifyOTP: ", data)

            if (data?.user && data?.token) {
                localStorage.setItem("token", data.token)
                return data.user
            } else {
                localStorage.removeItem("token")
                throw new Error("Something went wrong", { cause: data })
            }
        } catch (error) {
            throw error
        }
    }

    async logout(): Promise<void> {
        try {
            const { data } = await api.post("/auth/logout")
            console.log("Request service => logout: ", data)
            localStorage.removeItem("token")
        } catch (error) {
            throw error
        }
    }

    async getLastMessages(): Promise<ILastMessage[]> {
        try {
            const { data } = await api.get("/messages/get-last-messages")
            console.log("Request service => get last messages: ", data)

            if (data?.lastMessages) {
                return data.lastMessages
            } else {
                throw new Error("Something went wrong", { cause: data })
            }
        } catch (error) {
            throw error
        }
    }

    async getMessages({ chatId, page = 1, limit = 20 }: { chatId: string, page?: number, limit?: number }): Promise<{ chats: IChatMessage[], hasMore: boolean }> {
        try {
            const { data } = await api.post("/messages/get-messages", { chatId, page, limit })
            console.log("Request service => get messages: ", data)

            if (data?.messages) {
                return data?.messages
            } else {
                throw Error("Something went wrong", { cause: data })
            }
        } catch (error) {
            throw error
        }
    }

    // Todo: set return type: note first from console log
    async getUnreadMessages() {
        try {
            const { data } = await api.get("/messages/get-unread-messages")
            console.log("Request service => get unread messages:", data)

            if (data?.unreadMessages) {
                return data?.unreadMessages
            } else {
                throw Error("Something went wrong", { cause: data })
            }
        } catch (error) {
            throw error
        }
    }

    async addConnection({ userEmailToAdd }: { userEmailToAdd: string }): Promise<IConnection> {
        try {
            const { data } = await api.post("/profile/add-connection", { userEmailToAdd })
            console.log("Request service => add connection: ", data)
            if (data?.addedConnection) {
                return data?.addedConnection
            } else {
                throw Error("Something went wrong", { cause: data })
            }
        } catch (error) {
            throw error
        }
    }

    async getProfile({ userId }: { userId: string }) {
        try {
            const { data } = await api.post("/profile/get", { userId })
            console.log("Request service => get profile: ", data)

            if (data?.profile) {
                return data?.profile
            } else {
                throw Error("Something went wrong", { cause: data })
            }
        } catch (error) {
            throw error
        }
    }
}

const requests = new Requests()
export default requests