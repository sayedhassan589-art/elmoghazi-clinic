const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.log('PAGE ERROR:', err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });

  try {
    console.log('Step 1: Navigate...');
    await page.goto('https://my-project-self-eight-86.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Click doctor role
    const doctorBtn = await page.$('button:has-text("طبيب")');
    if (doctorBtn) {
      await doctorBtn.click();
      await page.waitForTimeout(2000);
    }

    // Enter password
    const pwdInput = await page.$('input[type="password"]');
    if (pwdInput) {
      await pwdInput.fill('2137');
      await page.waitForTimeout(500);
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(5000);
      }
    }

    // Click More tab
    const moreBtn = await page.$('button:has-text("المزيد")');
    if (moreBtn) {
      console.log('Clicking More...');
      await moreBtn.click();
      await page.waitForTimeout(5000);
    }

    // Get the stack trace from the details element
    const stackTrace = await page.evaluate(() => {
      const details = document.querySelector('details');
      if (details) {
        return details.textContent;
      }
      return null;
    });
    console.log('Stack trace:', stackTrace);

    // Get the full error message
    const errorSection = await page.evaluate(() => {
      const div = document.querySelector('div[style*="padding: 1rem"]');
      return div ? div.innerText : null;
    });
    console.log('Error section:', errorSection);

    await page.screenshot({ path: '/home/z/my-project/download/more-error-stack.png' });

    console.log('\n=== ALL PAGE ERRORS ===');
    consoleErrors.forEach(e => console.log(e));

  } catch (e) {
    console.log('Test error:', e.message);
  }

  await browser.close();
})();
