import { Controller, Get, Post, Body, Response, Request } from '@nestjs/common'
const { join } = require("path")
const { readdirSync, mkdirSync, writeFileSync, readFileSync } = require('fs')
import { EmailService } from './email.service'
import { SecurityService } from './security.service'

import config from "../config"
let loginPath = config.user.path // 用户登录空间根路径

// 邮箱验证码列表
let emailCodes = {}

@Controller('/verification')
export class VerificationController {
    constructor(private readonly emailService: EmailService, private readonly securityService: SecurityService) { }

    @Get('/logout')
    async doLoginout(@Request() req: any) {
        let loginid = this.securityService.isLogin(req.header("cookie"))

        if (loginid) {
            writeFileSync(join(loginPath, loginid, 'token'), 'EXIT')
        }

        return {
            code: '000000',
            msg: '退出登录成功'
        }
    }

    @Post('/login')
    async doLogin(@Body() body: any, @Response() res: any) {
        if (readdirSync(loginPath).indexOf(body.username) < 0) {
            res.json({
                code: '999999',
                msg: '用户名不存在'
            })
        } else {
            let password = readFileSync(join(loginPath, body.username, 'password'))

            if (password == body.password) {
                let userinfo = JSON.parse(readFileSync(join(loginPath, body.username, 'infomation')))

                let token = this.securityService.getToken()
                writeFileSync(join(loginPath, body.username, 'token'), token)

                res.header('Set-Cookie', ["LOGINID=" + body.username + "; Path=/; HttpOnly", "LOGINTOKEN=" + token + "; Path=/; HttpOnly"]);

                // 特别注意：使用@Response以后，需要主动处理返回
                res.json({
                    code: '000000',
                    msg: '登录成功',
                    data: userinfo
                })
            } else {
                res.json({
                    code: '999999',
                    msg: '密码错误'
                })
            }
        }
    }

    @Post('/registry')
    async doRegistry(@Body() body: any): Promise<any> {
        return new Promise((resolve) => {
            if (readdirSync(loginPath).indexOf(body.username) < 0) {

                // 邮箱验证码正确且是用于注册的
                if (emailCodes[body.email] && emailCodes[body.email].value == body.emailcode && emailCodes[body.email].type == "registry") {
                    delete emailCodes[body.email]

                    let userinfo = {
                        id: body.username,
                        email: body.email
                    }

                    mkdirSync(join(loginPath, body.username))
                    writeFileSync(join(loginPath, body.username, 'password'), body.password1)
                    writeFileSync(join(loginPath, body.username, 'infomation'), JSON.stringify(userinfo))

                    resolve({
                        code: '000000',
                        msg: '注册成功，去登录吧！'
                    })

                } else {
                    resolve({
                        code: '999999',
                        msg: '邮箱验证未通过'
                    })
                }

            } else {
                resolve({
                    code: '999999',
                    msg: '用户名已存在'
                })
            }
        })
    }

    @Post('/resetPassword')
    async doResetPassword(@Body() body: any): Promise<any> {
        return new Promise((resolve) => {
            if (readdirSync(loginPath).indexOf(body.username) >= 0) {

                let userinfo = JSON.parse(readFileSync(join(loginPath, body.username, 'infomation')))

                // 确保用的邮箱是注册时候的
                if (body.email == userinfo.email) {

                    // 邮箱验证码正确且是用于修改密码的
                    if (emailCodes[body.email] && emailCodes[body.email].value == body.emailcode && emailCodes[body.email].type == "forget") {
                        delete emailCodes[body.email]

                        writeFileSync(join(loginPath, body.username, 'password'), body.password1)

                        resolve({
                            code: '000000',
                            msg: '密码修改成功，去登录吧！'
                        })
                    } else {
                        resolve({
                            code: '999999',
                            msg: '邮箱验证未通过'
                        })
                    }
                } else {
                    resolve({
                        code: '999999',
                        msg: '请使用注册时邮箱进行验证'
                    })
                }

            } else {
                resolve({
                    code: '999999',
                    msg: '请确定用户名是否正确'
                })
            }
        })
    }


    @Post('/email')
    async doEmail(@Body() body: any): Promise<any> {
        return new Promise((resolve) => {
            if (body.type == 'registry' || body.type == 'forget') {

                let emailCode = (Math.random() * 10000000 + "").substring(0, 6)
                emailCodes[body.email] = {
                    value: emailCode,
                    type: body.type
                }

                console.log("[" + body.type + "]{" + body.email + "}邮箱验证码：" + emailCode)

                // 发送邮件并记录下来，以用于接下来的匹配
                this.emailService.sendEmail(body.email, `【文件管理系统】${{
                    registry: "注册验证码",
                    forget: "找回密码"
                }[body.type]}`, `<div style="font-size:20px;font-weight:800;padding:20px;">您的验证码 ：${emailCode}</div>
                <div style="color:#555;font-size:14px;padding:10px 20px;">(此验证码用于${{
                    registry: "注册账号",
                    forget: "找回密码"
                }[body.type]}，请勿泄露给他人)</div>
                `).then((info) => {
                    resolve({
                        code: '000000',
                        msg: '邮件已发送，请去邮箱查看验证码！'
                    })
                }).catch(e => {
                    resolve({
                        code: '999999',
                        msg: JSON.stringify(e)
                    })
                })
            } else {
                resolve({
                    code: '999999',
                    msg: '[email]邮件行为越界'
                })
            }
        })
    }
}
