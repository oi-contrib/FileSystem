import { Injectable } from '@nestjs/common'
const { join } = require("path")
const { readFileSync } = require('fs')

import config from "../config"
let loginPath = config.user.path // 用户登录空间根路径

// 安全相关

@Injectable()
export class SecurityService {

    getToken(): string {
        return (Math.random() * 10000000000000000).toFixed(0)
    }

    isLogin(cookie: string): boolean | string {
        let cookiesArray = (cookie || "").split(";"), cookies = {
            LOGINID: "",
            LOGINTOKEN: ""
        }

        for (let index = 0; index < cookiesArray.length; index++) {
            let cookieArray = cookiesArray[index].trim().split("=")
            cookies[cookieArray[0]] = cookieArray[1]
        }

        return (cookies.LOGINID && cookies.LOGINTOKEN && readFileSync(join(loginPath, cookies.LOGINID, 'token')) == cookies.LOGINTOKEN) ? cookies.LOGINID : false
    }
}