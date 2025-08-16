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
            debug: true,
            logger: true,
        }) as SMTPTransport.Options)
    }

    async sendMail({ to, subject, content }: { to: string, subject: string, content: string }) {
        console.log("\n\nSERVICE: sendMail")
        try {
            const mailOptions = {
                from: `Cubezy <${env.SMTP_FROM}>`,
                to,
                subject,
                html: content
            }

            await this.transporter.sendMail(mailOptions)
            return true
        } catch (error) {
            throw error
        }
    }
}

const mailService = new MailService()
export default mailService