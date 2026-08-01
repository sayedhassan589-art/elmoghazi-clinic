const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message.substring(0, 300)));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text().substring(0, 300));
  });
  
  await page.goto('https://my-project-self-eight-86.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Login
  await page.locator('button').filter({ hasText: /طبيب/ }).first().click();
  await page.waitForTimeout(2000);
  await page.locator('input[type="password"]').first().fill('2137');
  await page.waitForTimeout(500);
  const submitBtn = page.locator('button[type="submit"], button:has-text("دخول")').first();
  if (await submitBtn.count() > 0) await submitBtn.click();
  else await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
  
  // Click المزيد
  await page.locator('button:has-text("المزيد")').first().click();
  await page.waitForTimeout(8000);
  
  // Get the detailed error info from window.__SECTION_ERROR__
  const errorInfo = await page.evaluate(() => {
    return (window).__SECTION_ERROR__ || null;
  });
  
  if (errorInfo) {
    console.log('\n=== DETAILED ERROR INFO ===');
    console.log('Message:', errorInfo.message);
    console.log('\nComponent Stack:', errorInfo.componentStack);
    console.log('\nError Stack (first 500 chars):', (errorInfo.stack || '').substring(0, 500));
  } else {
    console.log('No __SECTION_ERROR__ found on window');
  }
  
  await browser.close();
})();
