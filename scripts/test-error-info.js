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

    // Click More tab
    const moreBtn = await page.$('button:has-text("المزيد")');
    if (moreBtn) { await moreBtn.click(); await page.waitForTimeout(5000); }

    // Get the error from window
    const errorInfo = await page.evaluate(() => {
      return (window).__SECTION_ERROR__ || null;
    });
    console.log('=== ERROR INFO ===');
    console.log(JSON.stringify(errorInfo, null, 2));

  } catch (e) {
    console.log('Test error:', e.message);
  }
  await browser.close();
})();
