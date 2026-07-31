const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    await page.goto('https://my-project-self-eight-86.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Login
    const doctorBtn = await page.$('button:has-text("طبيب")');
    if (doctorBtn) { await doctorBtn.click(); await page.waitForTimeout(2000); }
    const pwdInput = await page.$('input[type="password"]');
    if (pwdInput) {
      await pwdInput.fill('2137');
      await page.waitForTimeout(500);
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) { await submitBtn.click(); await page.waitForTimeout(5000); }
    }

    // Now set up error interception AFTER login
    await page.evaluate(() => {
      window.__capturedErrors = [];
      const origError = console.error;
      console.error = function(...args) {
        window.__capturedErrors.push(args.map(a => {
          try {
            if (a instanceof Error) return 'Error: ' + a.message + '\n' + a.stack;
            if (typeof a === 'object' && a !== null) return JSON.stringify(a).substring(0, 2000);
            return String(a).substring(0, 2000);
          } catch(e) { return 'unknown'; }
        }));
        origError.apply(console, args);
      };
    });

    // Click More tab
    const moreBtn = await page.$('button:has-text("المزيد")');
    if (moreBtn) { await moreBtn.click(); await page.waitForTimeout(8000); }

    // Get collected errors
    const errors = await page.evaluate(() => window.__capturedErrors || []);
    console.log('=== CAPTURED ERRORS ===');
    console.log(JSON.stringify(errors, null, 2));

    // Also try window.__SECTION_ERROR__
    const sectionError = await page.evaluate(() => window.__SECTION_ERROR__);
    console.log('\n=== SECTION ERROR ===');
    console.log(JSON.stringify(sectionError, null, 2));

  } catch (e) {
    console.log('Test error:', e.message);
  }
  await browser.close();
})();
