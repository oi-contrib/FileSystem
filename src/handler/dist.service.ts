import { Injectable } from '@nestjs/common'

const devby = require('devby')
const { join } = require("path")
const { existsSync, mkdirSync, readdirSync, writeFileSync, statSync } = require('fs')
const compressing = require('compressing')

import config from "../config"
let contextPath = config.data.path // 可操作目录根路径

// 磁盘操作服务

@Injectable()
export class DistService {

    // 获取文件列表
    getFileList(filePath: string): any {
        devby.log(new Date().toLocaleString() + " 当前访问: " + filePath.replace(contextPath, './'))

        // 读取子文件
        const subFiles = readdirSync(filePath)

        let resultData = []
        for (let index = 0; index < subFiles.length; index++) {
            let statObj = statSync(join(filePath, subFiles[index]))
            let isDir = statObj.isDirectory()

            // 是文件夹或不是临时文件
            if (!/\_\d+\_FileSystemCache$/.test(subFiles[index]) || isDir) {

                let dotName = /\./.test(subFiles[index]) ? subFiles[index].match(/\.([^.]+)$/)[1] : ""

                resultData.push({
                    name: subFiles[index],
                    isDirectory: isDir,
                    mtime: statObj.mtime,
                    size: isDir ? "" : (statObj.size + "字节"),
                    type: devby.mimeTypes[dotName] || "text/plain"
                })

            }
        }

        return resultData
    }

    // 写文件到磁盘
    writeFileSync(filepath: string, data: any): void {

        let needMkdirPaths: Array<string> = [], tempPath = filepath

        while (true) {

            let currentPath = join(tempPath, "../")
            if (existsSync(currentPath)) {

                for (let index = 0; index < needMkdirPaths.length; index++) {
                    mkdirSync(needMkdirPaths[index])
                }
                writeFileSync(filepath, data)

                return
            } else {
                needMkdirPaths.unshift(currentPath)
                tempPath = currentPath
            }

        }
    }

    // 压缩文件夹
    zipFolderSync(filepath: string): void {
        return compressing.zip.compressDir(filepath, filepath + ".zip").catch((err: any) => {
            console.log(err)
        })
    }

    // 解压压缩包
    unzipSync(filepath: string): void {
        return compressing.zip.uncompress(filepath, join(filepath, "../")).catch((err: any) => {
            console.log(err)
        })
    }
}