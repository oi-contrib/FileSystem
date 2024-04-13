import { Injectable } from '@nestjs/common'
const nodemailer = require("nodemailer")

import config from "../config"

const transporter = nodemailer.createTransport(config.email)

// 邮箱服务

@Injectable()
export class EmailService {

    sendEmail(email: string, subject: string, html: string): Promise<any> {
        return transporter.sendMail({
            from: `文件管理系统 <${config.email.auth.user}>`,
            to: email,
            subject,
            html
        })
    }
}