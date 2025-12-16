const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const url = process.argv[2] || 'http://localhost:49152';
  const outDir = path.resolve(__dirname, '..', 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outFile = path.join(outDir, 'dashboard-dark.png');

  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#theme-toggle', { timeout: 5000 });

    // Ensure dark: click the theme box (Dashboard control) until documentElement has class 'dark' (max 3 tries)
    for (let i = 0; i < 3; i++) {
      const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      if (isDark) break;
      const box = await page.$('[title="Alternar tema claro/oscuro"]');
      if (box) {
        await box.click();
      } else {
        // fallback to inner toggle
        const t = await page.$('#theme-toggle');
        if (t) await t.click();
      }
      await new Promise(r => setTimeout(r, 500));
    }

    // Ensure we're on dashboard: click Dashboard tab if present
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Inicio'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    await page.screenshot({ path: outFile, fullPage: true });
    console.log('Captured', outFile);
  } catch (err) {
    console.error('Error capturing page:', err);
    process.exit(2);
  } finally {
    await browser.close();
  }
})();