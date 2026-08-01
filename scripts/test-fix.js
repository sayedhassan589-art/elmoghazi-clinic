const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

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
      if (submitBtn) { await submitBtn.click(); await page.waitForTimeout(4); }
    }

    // Click More tab
    const moreBtn = await page.$('button:has-text("المزيد")');
    if (moreBtn) { await moreBtn.click(); await page.waitForTimeout(8000); }

    // Check result
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    const hasError = bodyText.includes('حدث خطأ');
    console.log('Has error:', hasError);
    if (hasError) {
      console.log('Error text:', bodyText.substring(0, 500));
    } else {
      console.log('More section loaded successfully!');
      console.log('Content preview:', bodyText.substring(0, 300));
    }

    await page.screenshot({ path: '/home/z/my-project/download/more-section-test.png' });

    console.log('Page errors:', errors.length);

  } catch (e) {
    console.log('Test error:', e.message);
  }
  await browser.close();
})();
