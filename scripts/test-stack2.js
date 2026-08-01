const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('pageerror', err => {
    consoleErrors.push(err.message + '\n' + err.stack);
    console.log('PAGE ERROR:', err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });

  try {
    console.log('Step 1: Navigate...');
    await page.goto('https://my-project-self-eight-86.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Log current page state
    const bodyText1 = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('Page after load:', bodyText1.substring(0, 200));

    // Click doctor role
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons`);
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('طبيب')) {
        console.log('Clicking doctor button...');
        await btn.click();
        break;
      }
    }
    await page.waitForTimeout(3000);

    // Enter password
    const pwdInput = await page.$('input[type="password"]');
    console.log('Password input found:', !!pwdInput);
    if (pwdInput) {
      await pwdInput.fill('2137');
      await page.waitForTimeout(500);
      // Find and click submit
      const allBtns = await page.$$('button');
      for (const btn of allBtns) {
        const text = await btn.textContent();
        if (text && (text.includes('دخول') || text.includes('تسجيل'))) {
          console.log('Clicking login button...');
          await btn.click();
          break;
        }
      }
      await page.waitForTimeout(5000);
    }

    // Check state after login
    const bodyText2 = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('After login:', bodyText2.substring(0, 200));

    // Find and click More tab
    const allBtns2 = await page.$$('button');
    for (const btn of allBtns2) {
      const text = await btn.textContent();
      if (text && text.includes('المزيد')) {
        console.log('Clicking More tab...');
        await btn.click();
        await page.waitForTimeout(5000);
        break;
      }
    }

    // Check for error
    const bodyText3 = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('After More click:', bodyText3.substring(0, 200));

    // Get stack trace
    const stackTrace = await page.evaluate(() => {
      const details = document.querySelector('details');
      if (details) return details.textContent;
      return null;
    });
    console.log('Stack trace:', stackTrace);

    await page.screenshot({ path: '/home/z/my-project/download/more-error.png' });

    console.log('\n=== ALL PAGE ERRORS ===');
    consoleErrors.forEach((e, i) => console.log(`Error ${i}:`, e));

  } catch (e) {
    console.log('Test error:', e.message);
  }

  await browser.close();
})();
