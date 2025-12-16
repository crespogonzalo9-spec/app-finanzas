const http = require('http');
const fs = require('fs');
const path = require('path');

const port = parseInt(process.argv[2], 10) || 49152;
const buildDir = path.resolve(__dirname, '..', 'build');

const mime = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(buildDir, decodeURIComponent(reqPath));
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404; res.end('Not found'); return;
    }
    const ext = path.extname(filePath);
    res.setHeader('Content-Type', mime[ext] || 'text/plain');
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Serving build at http://localhost:${port}`);
});

process.on('SIGTERM', () => server.close());
