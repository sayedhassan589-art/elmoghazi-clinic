const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Collect console errors
  const errors = [];
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('PAGE ERROR:', err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });

  try {
    // Go to the app
    console.log('Navigating to app...');
    await page.goto('https://my-project-self-eight-86.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Try to login
    console.log('Looking for login form...');
    const passwordInput = await page.$('input[type="password"], input[placeholder*="كلمة"], input[placeholder*="رمز"]');
    if (passwordInput) {
      console.log('Found password input, entering password...');
      await passwordInput.fill('2137');
      // Click login button
      const loginBtn = await page.$('button:has-text("دخول"), button:has-text("تسجيل"), button[type="submit"]');
      if (loginBtn) {
        await loginBtn.click();
        await page.waitForTimeout(3000);
        console.log('Logged in');
      }
    } else {
      console.log('No password input found - might already be logged in');
    }

    // Take screenshot
    await page.screenshot({ path: '/home/z/my-project/download/after-login.png' });

    // Try to click on "المزيد" (More) tab
    console.log('Looking for More tab...');
    const moreTab = await page.$('text=المزيد', { timeout: 5000 }).catch(() => null);
    if (moreTab) {
      console.log('Clicking More tab...');
      await moreTab.click();
      await page.waitForTimeout(3000);
    } else {
      // Try alternative selectors
      console.log('Trying alternative selectors for More tab...');
      const tabs = await page.$$('button');
      for (const tab of tabs) {
        const text = await tab.textContent();
        if (text && text.includes('المزيد')) {
          console.log('Found More tab, clicking...');
          await tab.click();
          await page.waitForTimeout(3000);
          break;
        }
      }
    }

    // Take screenshot after clicking More
    await page.screenshot({ path: '/home/z/my-project/download/after-more-click.png' });

    // Check for error text
    const errorText = await page.$('text=حدث خطأ');
    if (errorText) {
      console.log('ERROR FOUND ON PAGE!');
      const pageContent = await page.content();
      // Extract error message
      const errorMatch = pageContent.match(/Cannot read properties of undefined[^<]*/);
      if (errorMatch) console.log('ERROR MESSAGE:', errorMatch[0]);
    }

    // Print all errors
    console.log('\n=== ALL ERRORS ===');
    errors.forEach(e => console.log(e));

  } catch (e) {
    console.log('Test error:', e.message);
  }

  await browser.close();
})();
