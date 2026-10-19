// Restore the original MIT-licensed kit artwork from an immutable source revision.
const fs = require('node:fs/promises')
const path = require('node:path')
const crypto = require('node:crypto')
const root = path.resolve(__dirname, '..')
const manifest = require('../asset-manifest.json')
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
let cursor = 0
async function worker() {
  while (cursor < manifest.length) {
    const item = manifest[cursor++]
    const target = path.resolve(root, item.path)
    if (!target.startsWith(root + path.sep)) throw new Error('Invalid asset path')
    try { if (hash(await fs.readFile(target)) === item.sha256) continue } catch {}
    const response = await fetch(item.url, { signal: AbortSignal.timeout(60000) })
    if (!response.ok) throw new Error(`Asset download failed: ${item.path} (${response.status})`)
    const bytes = Buffer.from(await response.arrayBuffer())
    if (hash(bytes) !== item.sha256) throw new Error(`Asset checksum mismatch: ${item.path}`)
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, bytes)
  }
}
Promise.all(Array.from({ length: 6 }, worker)).then(() => console.log(`Verified ${manifest.length} pinned Finmori assets.`)).catch(error => { console.error(error.message); process.exitCode = 1 })
