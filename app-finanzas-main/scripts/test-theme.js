const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

function serveBuild(port = 0) {
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
  return new Promise((resolve, reject) => {
    server.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

(async () => {
  const port = parseInt(process.argv[2], 10) || 5000;
  const server = await serveBuild(port);
  const address = server.address();
  const url = `http://localhost:${address.port}`;
  console.log('Serving build at', url);

  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(10000);
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#theme-toggle');

    const initial = await page.evaluate(() => ({ classList: Array.from(document.documentElement.classList), storage: localStorage.getItem('app-theme') }));
    console.log('Initial:', initial);

    await page.click('#theme-toggle');
    await new Promise(r => setTimeout(r, 500));

    const after = await page.evaluate(() => ({ classList: Array.from(document.documentElement.classList), storage: localStorage.getItem('app-theme') }));
    console.log('After click:', after);

    await page.reload({ waitUntil: 'networkidle2' });
    const afterReload = await page.evaluate(() => ({ classList: Array.from(document.documentElement.classList), storage: localStorage.getItem('app-theme') }));
    console.log('After reload:', afterReload);

    // Determine initial state and verify that the toggle changed it and persisted
    const initialWasDark = initial.classList.includes('dark');
    const toggledIsDark = after.classList.includes('dark');
    const persistedIsDark = afterReload.classList.includes('dark');
    const stored = after.storage || afterReload.storage;
    const expectedStored = toggledIsDark ? 'dark' : 'light';
    const passed = (toggledIsDark !== initialWasDark) && persistedIsDark === toggledIsDark && stored === expectedStored;
    console.log(passed ? 'TEST PASSED: theme toggled and persisted' : 'TEST FAILED');
    process.exit(passed ? 0 : 2);
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(3);
  } finally {
    await browser.close();
    server.close();
  }
})();
