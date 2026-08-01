const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', err => {
    errors.push({ message: err.message, stack: err.stack });
    console.log('PAGE ERROR:', err.message);
    console.log('STACK:', err.stack);
  });

  try {
    console.log('Navigating to local dev...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 60000 });
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

    // Click More tab
    const moreBtn = await page.$('button:has-text("المزيد")');
    if (moreBtn) { await moreBtn.click(); await page.waitForTimeout(8000); }

    console.log('\n=== ALL ERRORS ===');
    errors.forEach((e, i) => {
      console.log(`Error ${i}:`, e.message);
      console.log('Stack:', e.stack);
    });

  } catch (e) {
    console.log('Test error:', e.message);
  }
  await browser.close();
})();
