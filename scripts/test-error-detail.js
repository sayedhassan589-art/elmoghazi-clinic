const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const allErrors = [];
  page.on('pageerror', err => {
    allErrors.push({ message: err.message, stack: err.stack });
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('ErrorBoundary') || text.includes('name')) {
        allErrors.push({ consoleError: text.substring(0, 3000) });
      }
    }
  });

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

    // Click More tab
    const moreBtn = await page.$('button:has-text("المزيد")');
    if (moreBtn) { await moreBtn.click(); await page.waitForTimeout(8000); }

    // Get window error
    const windowError = await page.evaluate(() => (window).__SECTION_ERROR__);
    console.log('Window error:', JSON.stringify(windowError, null, 2));

    console.log('\n=== ALL CAPTURED ERRORS ===');
    allErrors.forEach((e, i) => {
      console.log(`\n--- Error ${i} ---`);
      if (e.consoleError) {
        console.log(e.consoleError);
      } else {
        console.log('Message:', e.message);
        console.log('Stack:', e.stack);
      }
    });

  } catch (e) {
    console.log('Test error:', e.message);
  }
  await browser.close();
})();
