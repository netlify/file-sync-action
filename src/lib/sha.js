import crypto from 'crypto'
import fs from 'fs/promises'

const getSHAOfLocalFile = async (path) => {
  let file

  try {
    file = await fs.readFile(path)
  } catch {
    return null
  }

  const input = `blob ${file.length}\u0000${file}`
  const sha1sum = crypto.createHash('sha1').update(input).digest('hex')

  return sha1sum
}

export { getSHAOfLocalFile }
