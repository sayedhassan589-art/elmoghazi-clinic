const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', err => {
    errors.push(err.message + '\n' + err.stack);
    console.log('PAGE ERROR:', err.message);
  });

  try {
    console.log('Navigating to app...');
    await page.goto('https://my-project-self-eight-86.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Get page content
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log('PAGE CONTENT:', bodyText);

    // Take screenshot
    await page.screenshot({ path: '/home/z/my-project/download/page-state.png' });

    // Find all buttons
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons`);
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text) console.log('  Button:', text.trim().substring(0, 50));
    }

    // Check if there's a password field
    const inputs = await page.$$('input');
    console.log(`Found ${inputs.length} inputs`);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const placeholder = await inp.getAttribute('placeholder');
      console.log(`  Input: type=${type}, placeholder=${placeholder}`);
    }

    // Try login with 2137
    const pwdInput = await page.$('input[type="password"]');
    if (pwdInput) {
      console.log('Found password input, logging in...');
      await pwdInput.fill('2137');
      await page.waitForTimeout(500);
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(5000);
        console.log('After login, page content:');
        const afterLogin = await page.evaluate(() => document.body.innerText.substring(0, 2000));
        console.log(afterLogin);
        await page.screenshot({ path: '/home/z/my-project/download/after-login.png' });
      }
    }

    // Now try to navigate to More tab
    const moreBtn = await page.$('button:has-text("المزيد")');
    if (moreBtn) {
      console.log('Found More button, clicking...');
      await moreBtn.click();
      await page.waitForTimeout(5000);
    } else {
      // Try nav items
      const navItems = await page.$$('[role="tab"], nav button, .tab, [data-tab]');
      console.log(`Found ${navItems.length} nav items`);
      for (const item of navItems) {
        const text = await item.textContent();
        console.log('  Nav item:', text?.trim());
        if (text?.includes('المزيد')) {
          console.log('Clicking More nav item...');
          await item.click();
          await page.waitForTimeout(5000);
          break;
        }
      }
    }

    // Check for error
    const afterContent = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log('After clicking More:', afterContent);
    await page.screenshot({ path: '/home/z/my-project/download/after-more.png' });

    console.log('\n=== ALL ERRORS ===');
    errors.forEach(e => console.log(e));

  } catch (e) {
    console.log('Test error:', e.message);
  }

  await browser.close();
})();
