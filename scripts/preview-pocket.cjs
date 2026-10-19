const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '../dist')
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }
http.createServer((req, res) => {
  let file
  try { const url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); file = path.resolve(root, '.' + (url === '/' ? '/pocket.html' : url)) }
  catch { res.writeHead(400); res.end(); return }
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return }
  if (!path.extname(file) && fs.existsSync(file + '.html')) file += '.html'
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found. Run npm run build:web first.'); return }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' })
    res.end(req.method === 'HEAD' ? undefined : data)
  })
}).listen(8081, '127.0.0.1', () => console.log('Finmori Pocket: http://localhost:8081/pocket'))
