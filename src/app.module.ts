import { Module } from '@nestjs/common'
import { VerificationModule } from './verification/index.module'
import { HandlerModule } from './handler/index.module'
import { ServeStaticModule } from '@nestjs/serve-static'
import * as fs from 'fs'
import config from './config'

const rootPath = require('path').join(__dirname, '../client')

fs.writeFileSync("./client/libs/system.info.js", `window.systemInfo = {
  "version": "${require('../package.json').version}",
  "data": {
    folder: "${config.data.folder}"
  }
};`)

// 上传文件存放位置
if (!fs.existsSync(config.data.path)) fs.mkdirSync(config.data.path)

// 用户登录空间内容
if (!fs.existsSync(config.user.path)) fs.mkdirSync(config.user.path)

@Module({
  imports: [
    VerificationModule,
    HandlerModule,
    ServeStaticModule.forRoot({
      rootPath
    })
  ],
  controllers: [],
  providers: []
})
export class AppModule { }
