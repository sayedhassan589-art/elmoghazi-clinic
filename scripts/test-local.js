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
    console.log('Step 1: Navigate to local dev...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Click doctor role
    const buttons = await page.$$('button');
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
    if (pwdInput) {
      await pwdInput.fill('2137');
      await page.waitForTimeout(500);
      const allBtns = await page.$$('button');
      for (const btn of allBtns) {
        const text = await btn.textContent();
        if (text && (text.includes('دخول') || text.includes('تسجيل'))) {
          console.log('Clicking login...');
          await btn.click();
          break;
        }
      }
      await page.waitForTimeout(5000);
    }

    // Click More tab
    const allBtns2 = await page.$$('button');
    for (const btn of allBtns2) {
      const text = await btn.textContent();
      if (text && text.includes('المزيد')) {
        console.log('Clicking More...');
        await btn.click();
        await page.waitForTimeout(5000);
        break;
      }
    }

    console.log('\n=== ALL PAGE ERRORS ===');
    consoleErrors.forEach((e, i) => console.log(`Error ${i}:`, e));

  } catch (e) {
    console.log('Test error:', e.message);
  }

  await browser.close();
})();
