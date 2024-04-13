const { copySync, deleteSync, log, error } = require("devby")
const compressing = require("compressing")
const pkg = require("../package.json")

deleteSync("./FileSystem")
deleteSync("./userlogin")
deleteSync("./client/userspace")

copySync("./dist", "./FileSystem/dist")
copySync("./client", "./FileSystem/client")
copySync("./.mailmap", "./FileSystem/.mailmap")
copySync("./AUTHORS.txt", "./FileSystem/AUTHORS.txt")
copySync("./CHANGELOG", "./FileSystem/CHANGELOG")
copySync("./LICENSE", "./FileSystem/LICENSE")
copySync("./package.json", "./FileSystem/package.json")
copySync("./package-lock.json", "./FileSystem/package-lock.json")
copySync("./README.md", "./FileSystem/README.md")

compressing.zip.compressDir("./FileSystem", "./FileSystem-v" + pkg.version + ".zip").then(() => {
    deleteSync("./FileSystem")

    log("打包完成\n")
}).catch((e) => {
    error(e)
})