const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', err => {
    errors.push({ message: err.message, stack: err.stack });
    console.log('PAGE ERROR:', err.message);
  });

  try {
    console.log('Step 1: Navigate to app...');
    await page.goto('https://my-project-self-eight-86.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Click doctor button
    console.log('Step 2: Click doctor role...');
    const doctorBtn = await page.$('button:has-text("طبيب")');
    if (doctorBtn) {
      await doctorBtn.click();
      await page.waitForTimeout(2000);
      console.log('Clicked doctor button');
    }

    // Check for password input
    const pwdInput = await page.$('input[type="password"]');
    if (pwdInput) {
      console.log('Step 3: Enter password...');
      await pwdInput.fill('2137');
      await page.waitForTimeout(500);
      const submitBtn = await page.$('button[type="submit"], button:has-text("دخول"), button:has-text("تسجيل")');
      if (submitBtn) {
        await submitBtn.click();
        console.log('Submitted password');
      } else {
        // Try pressing Enter
        await pwdInput.press('Enter');
      }
      await page.waitForTimeout(5000);
    }

    await page.screenshot({ path: '/home/z/my-project/download/after-login2.png' });
    const content = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log('After login:', content.substring(0, 500));

    // Navigate to More tab
    console.log('Step 4: Navigate to More tab...');
    const moreBtn = await page.$('button:has-text("المزيد")');
    if (moreBtn) {
      console.log('Clicking More button...');
      await moreBtn.click();
      await page.waitForTimeout(5000);
    } else {
      console.log('No More button found, looking for alternatives...');
      // List all visible text
      const allText = await page.evaluate(() => document.body.innerText);
      console.log('Page text:', allText.substring(0, 1000));
    }

    await page.screenshot({ path: '/home/z/my-project/download/after-more2.png' });
    const afterMore = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log('After More:', afterMore.substring(0, 500));

    // Print all errors
    console.log('\n=== ALL ERRORS ===');
    errors.forEach((e, i) => {
      console.log(`Error ${i + 1}:`, e.message);
      if (e.stack) console.log('Stack:', e.stack.substring(0, 500));
    });

  } catch (e) {
    console.log('Test error:', e.message);
  }

  await browser.close();
})();
