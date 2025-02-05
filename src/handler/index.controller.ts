import { Controller, Get, Post, Query, UploadedFile, UseInterceptors, Body, Request } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { DistService } from './dist.service'
import { SecurityService } from '../verification/security.service'
import * as fs from 'fs'

const devby = require('devby')
const { join } = require('path')

declare type resultType = {
    code: string
    msg: string
}

import config from "../config"
let contextPath = config.data.path // 可操作目录根路径

@Controller('/handler')
export class HandlerController {
    constructor(private readonly distService: DistService, private readonly securityService: SecurityService) { }

    // 查询列表
    @Get('/queryAll')
    queryAll(@Query() query: {
        path: string
    }, @Request() req: any): any {

        if (this.securityService.isLogin(req.header("cookie"))) {
            return {
                code: '000000',
                filelist: this.distService.getFileList(join(contextPath, query.path))
            }
        } else {
            return {
                code: '-1',
                msg: "登录失效"
            }
        }

    }

    // 上传文件
    @Post('/upload')
    @UseInterceptors(FileInterceptor('file'))
    upload(@UploadedFile() file, @Body() body: any, @Request() req: any) {

        if (this.securityService.isLogin(req.header("cookie"))) {

            let targetPath = join(contextPath, body.path, decodeURIComponent(body.filepath))
            this.distService.writeFileSync(targetPath, file.buffer)

            devby.warn(new Date().toLocaleString() + " 文件上传: ./" + join(body.path, decodeURIComponent(body.filepath)))
            return {
                code: '000000',
                msg: "上传成功"
            }

        } else {
            return {
                code: '-1',
                msg: "登录失效"
            }
        }

    }

    // 分片上传大文件
    @Post('/uploadSlice')
    @UseInterceptors(FileInterceptor('data'))
    uploadSlice(@UploadedFile() file, @Body() body: any, @Request() req: any) {

        if (this.securityService.isLogin(req.header("cookie"))) {

            let targetPath = join(contextPath, body.path, decodeURIComponent(body.filepath))
            let index = 1 - -body.index, total = 0 - -body.total

            // 一个个片段保存起来
            this.distService.writeFileSync(targetPath + "_" + body.index + "_FileSystemCache", file.buffer)

            devby.warn(new Date().toLocaleString() + " 分片上传（" + index + "/" + total + "）: ./" + join(body.path, decodeURIComponent(body.filepath)))

            // 如果全部上传完成，合并
            if (index >= total) {

                // 一个个拼接起来
                let fd = fs.openSync(targetPath, 'a')
                for (let index = 0; index < total; index++) {

                    let buff = fs.readFileSync(targetPath + '_' + index + "_FileSystemCache")
                    fs.writeSync(fd, buff, 0, buff.length, (0 - -body.size) * index)

                    // 使用完毕后删除片段
                    fs.unlinkSync(targetPath + '_' + index + "_FileSystemCache")
                }
                fs.closeSync(fd)
            }

            return {
                code: '000000',
                msg: "上传成功"
            }

        } else {
            return {
                code: '-1',
                msg: "登录失效"
            }
        }

    }

    // 粘贴文件
    @Get('/paste')
    paste(@Query() query: {
        sourcePath: string
        targetPath: string
        sourceName: string
        type: string
    }, @Request() req: any): any {

        if (this.securityService.isLogin(req.header("cookie"))) {

            if (query.type == 'copy') {
                devby.copySync(
                    join(contextPath, query.sourcePath, query.sourceName),
                    join(contextPath, query.targetPath, query.sourceName)
                )
            } else {
                devby.moveSync(
                    join(contextPath, query.sourcePath, query.sourceName),
                    join(contextPath, query.targetPath, query.sourceName)
                )
            }

            return {
                code: '000000',
                msg: "粘贴成功"
            }

        } else {
            return {
                code: '-1',
                msg: "登录失效"
            }
        }

    }

    // 压缩文件夹
    @Get('/zip')
    async zip(@Query() query: {
        sourcePath: string
        sourceName: string
    }, @Request() req: any): Promise<resultType> {

        if (this.securityService.isLogin(req.header("cookie"))) {

            await this.distService.zipFolderSync(join(contextPath, query.sourcePath, query.sourceName))

            return {
                code: '000000',
                msg: `已将${query.sourceName}压缩为${query.sourceName}.zip`
            }

        } else {
            return Promise.resolve({
                code: '-1',
                msg: "登录失效"
            })
        }
    }

    // 解压文件
    @Get('/unzip')
    async unzip(@Query() query: {
        sourcePath: string
        sourceName: string
    }, @Request() req: any): Promise<resultType> {

        if (this.securityService.isLogin(req.header("cookie"))) {

            await this.distService.unzipSync(join(contextPath, query.sourcePath, query.sourceName))

            return {
                code: '000000',
                msg: `${query.sourceName}已解压成功`
            }

        } else {
            return Promise.resolve({
                code: '-1',
                msg: "登录失效"
            })
        }

    }

    // 删除文件
    @Get('/deleteFile')
    deleteFile(@Query() query: {
        fullPath: string
    }, @Request() req: any): any {

        if (this.securityService.isLogin(req.header("cookie"))) {

            devby.deleteSync(join(contextPath, query.fullPath))

            return {
                code: '000000',
                msg: `${query.fullPath}已删除成功`
            }

        } else {
            return Promise.resolve({
                code: '-1',
                msg: "登录失效"
            })
        }

    }

    // 读取文本
    @Get('/readPlainFile')
    readPlainFile(@Query() query: {
        fullPath: string
    }, @Request() req: any): any {
        if (this.securityService.isLogin(req.header("cookie"))) {

            return {
                code: '000000',
                msg: fs.readFileSync(join(contextPath, query.fullPath), {
                    encoding: "utf8"
                })
            }

        } else {
            return Promise.resolve({
                code: '-1',
                msg: "登录失效"
            })
        }
    }
}
