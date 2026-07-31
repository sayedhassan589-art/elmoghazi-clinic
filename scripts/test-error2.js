const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  try {
    await page.goto('https://my-project-self-eight-86.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Login as doctor
    const doctorBtn = page.locator('button:has-text("طبيب")');
    await doctorBtn.first().click();
    await page.waitForTimeout(1000);
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('2137');
    await page.waitForTimeout(500);
    
    const loginBtn = page.locator('button:has-text("دخول")');
    await loginBtn.click();
    await page.waitForTimeout(5000);
    
    // Check dashboard
    const bodyText = await page.locator('body').innerText();
    if (bodyText.includes('حدث خطأ')) {
      console.log('ERROR on dashboard:', bodyText.substring(0, 500));
    } else {
      console.log('Dashboard OK');
    }
    
    // Test each tab
    const tabs = ['الرسائل', 'المرضى', 'الليزر', 'المالية', 'المزيد'];
    for (const tabName of tabs) {
      console.log(`\nTesting ${tabName}...`);
      const tabBtn = page.locator(`button:has-text("${tabName}")`);
      if (await tabBtn.count() > 0) {
        await tabBtn.first().click();
        await page.waitForTimeout(3000);
        
        const text = await page.locator('body').innerText();
        if (text.includes('حدث خطأ')) {
          console.log(`ERROR on ${tabName}:`, text.substring(0, 300));
          // Try to retry
          const retryBtn = page.locator('button:has-text("إعادة المحاولة")');
          if (await retryBtn.count() > 0) {
            await retryBtn.click();
            await page.waitForTimeout(3000);
          }
        } else {
          console.log(`${tabName} OK`);
        }
      }
    }
    
  } catch (e) {
    console.error('Test error:', e.message);
  }

  if (errors.length > 0) {
    console.log('\n--- BROWSER ERRORS ---');
    errors.forEach(err => console.log('  -', err));
  }

  await browser.close();
})();
