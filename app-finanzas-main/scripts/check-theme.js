const puppeteer = require('puppeteer');

(async () => {
  const url = process.argv[2] || 'http://localhost:49152';
  console.log('Checking', url);
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));

    const infoBefore = await page.evaluate(() => {
      const isDark = document.documentElement.classList.contains('dark');
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      const mainDiv = document.querySelector('.min-h-screen');
      const mainBg = mainDiv ? getComputedStyle(mainDiv).backgroundColor : null;
      const anyCard = document.querySelector('.bg-white');
      const anyCardBg = anyCard ? getComputedStyle(anyCard).backgroundColor : null;
      // Check if our rule exists in stylesheets
      const rules = [];
      for (const ss of Array.from(document.styleSheets)) {
        try {
          for (const r of Array.from(ss.cssRules || [])) {
            if (r.cssText && r.cssText.includes('.dark .bg-white')) rules.push(r.cssText);
          }
        } catch (e) { /* may be cross-origin */ }
      }
      const inlineBg = anyCard ? anyCard.style.backgroundColor || null : null;
      return { isDark, bodyBg, mainBg, anyCardBg, inlineBg, foundRules: rules };
    });

    console.log('Before:', infoBefore);

    const switchEl = await page.$('#theme-switch') || await page.$('[title="Alternar tema claro/oscuro"]');
    if (!switchEl) {
      console.log('No theme switch found');
      await browser.close();
      process.exit(2);
    }

    await switchEl.click();
    await new Promise(r => setTimeout(r, 500));

    const infoAfter = await page.evaluate(() => {
      const isDark = document.documentElement.classList.contains('dark');
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      const mainDiv = document.querySelector('.min-h-screen');
      const mainBg = mainDiv ? getComputedStyle(mainDiv).backgroundColor : null;
      const anyCard = document.querySelector('.bg-white');
      const anyCardBg = anyCard ? getComputedStyle(anyCard).backgroundColor : null;
      const inlineBg = anyCard ? anyCard.style.backgroundColor || null : null;
      return { isDark, bodyBg, mainBg, anyCardBg, inlineBg };
    });

    console.log('After:', infoAfter);

    // Basic assertions: an element with .bg-white should exist and its computed background must change
    if (!infoBefore.anyCardBg || !infoAfter.anyCardBg) {
      console.error('ERROR: Could not find an element with class .bg-white or computed backgrounds are missing.');
      await browser.close();
      process.exit(4);
    }
    if (infoBefore.anyCardBg === infoAfter.anyCardBg) {
      console.error('ERROR: Computed background for .bg-white did not change:', infoBefore.anyCardBg);
      await browser.close();
      process.exit(5);
    }

    console.log('OK: computed styles changed for .bg-white (', infoBefore.anyCardBg, '->', infoAfter.anyCardBg, ')');

    await browser.close();
  } catch (err) {
    console.error('Error:', err);
    await browser.close();
    process.exit(3);
  }
})();