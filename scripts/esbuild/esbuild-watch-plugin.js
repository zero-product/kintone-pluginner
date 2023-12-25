const fs    = require('fs')
const fsx   = require('fs-extra')
const path  = require('path')
const { exec } = require('child_process')
const createManifest = require(path.resolve('scripts/create-manifest'))

const watchPlugin = {
  name: 'watch-plugin',
  setup(build) {
    build.onEnd(async (result) => {

      if (result.errors.length > 0) {
        console.log('🚫 Error!')
        console.log(result.errors)
      } else {
        fsx.copySync(path.resolve(`src/icon.png`),    path.resolve(`dist/icon.png`))
        fsx.copySync(path.resolve(`src/config.html`), path.resolve(`dist/config.html`))

        const cssDir = path.resolve(`dist/css`)
        if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir)

        createManifest()

        await pluginPacker()

        console.log('🏠 Builded!')
      }
    })
  }
}

module.exports = watchPlugin


const pluginPacker = () => {
  const command = `yarn kintone-plugin-packer --ppk private.ppk --out plugin.zip dist`
  return new Promise((resolve, reject) => {
    exec(command, { encoding: 'UTF-8' }, (err, stdout, stderr) => {
      if (err) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })
  })
}
