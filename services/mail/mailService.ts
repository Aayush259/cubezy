import env from "@/config/envConf"
import nodemailer from "nodemailer"
import SMTPTransport from "nodemailer/lib/smtp-transport"

export class MailService {
    private transporter: nodemailer.Transporter

    constructor() {
        this.transporter = nodemailer.createTransport(({
            host: env.SMTP_HOST,
            port: Number(env.SMTP_PORT),
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASSWORD,
            },
            logger: true,
            debug: true,
        }) as SMTPTransport.Options)
    }

    async sendMail({ to, subject, content }: { to: string, subject: string, content: string }) {
        console.log("\n\nSERVICE: sendMail", { to, subject, content })
        try {
            console.log(env.SMTP_FROM, env.SMTP_HOST, env.SMTP_PORT, env.SMTP_USER, env.SMTP_PASSWORD)
            const mailOptions = {
                from: `Cubezy <${env.SMTP_FROM}>`,
                to,
                subject,
                html: content
            }

            const info = await this.transporter.sendMail(mailOptions)
            console.log("SERVICE: sendMail => Mail sent", { to, subject, content, info })
            return true
        } catch (error) {
            throw error
        }
    }
}

const mailService = new MailService()
export default mailService