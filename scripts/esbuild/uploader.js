const axios = require('axios')
const path  = require('node:path')
const fs    = require('node:fs');
const auth  = require(path.resolve('auth.json'))

const pluginUploader = () => {
  const pluginPath = path.resolve(process.cwd()+'/plugin.zip')
  if (!fs.existsSync(pluginPath)) {
    throw new Error('プラグインファイル(zip)がありません。ビルドしてください。')
  }

  return new Promise((resolve, reject) => {
    const Authorization = Buffer.from(`${auth?.username}:${auth?.password}`).toString('base64')

    const client = axios.create({
      baseURL: auth?.base_url+'/k/api',
      headers: { 'X-Cybozu-Authorization': Authorization },
    })

    client.post('/blob/upload.json', { file: fs.createReadStream(pluginPath) }, {
      headers: { 'Content-Type': 'multipart/form-data', }
    }).then(({data}) => {
      const fileKey = data.result?.fileKey

      client.post('/dev/plugin/import.json', { item: fileKey }).then(({data}) => {
        if (data.success) {
          console.log('✅ Uploaded!')
          resolve(data.result)
        } else {
          reject(data)
        }
      }).catch(e => {
        console.error(e)
        reject(e.response)
      })
    }).catch(e => {
      console.error(e)
      reject(e.response)
    })
  })
}

module.exports = pluginUploader