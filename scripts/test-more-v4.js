const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('PAGE ERROR:', err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  
  console.log('1. Navigating to app...');
  await page.goto('https://my-project-self-eight-86.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Click doctor role
  await page.locator('button').filter({ hasText: /طبيب/ }).first().click();
  await page.waitForTimeout(2000);
  
  // Enter password
  await page.locator('input[type="password"]').first().fill('2137');
  await page.waitForTimeout(500);
  
  const submitBtn = page.locator('button[type="submit"], button:has-text("دخول")').first();
  if (await submitBtn.count() > 0) await submitBtn.click();
  else await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
  
  // Click المزيد
  console.log('2. Clicking المزيد...');
  await page.locator('button:has-text("المزيد")').first().click();
  await page.waitForTimeout(8000);
  
  // Get error text from the page
  const errorElements = await page.locator('text=حدث خطأ').all();
  console.log('Error elements found:', errorElements.length);
  
  // Get the actual error message
  const errorBoundary = page.locator('[class*="error"], [role="alert"]').first();
  if (await errorBoundary.count() > 0) {
    const text = await errorBoundary.textContent();
    console.log('Error boundary text:', text);
  }
  
  // Try to find the actual error message anywhere on the page
  const bodyText = await page.locator('body').textContent();
  
  // Look for error indicators
  const errorPatterns = ['حدث خطأ', 'Cannot access', 'before initialization', 'Cannot read', 'undefined'];
  for (const pattern of errorPatterns) {
    if (bodyText.includes(pattern)) {
      // Find the context around the error
      const idx = bodyText.indexOf(pattern);
      const start = Math.max(0, idx - 50);
      const end = Math.min(bodyText.length, idx + pattern.length + 100);
      console.log(`Found "${pattern}" in page text. Context: ...${bodyText.slice(start, end)}...`);
    }
  }
  
  await page.screenshot({ path: '/home/z/my-project/download/more-section-error.png', fullPage: true });
  
  if (errors.length > 0) {
    console.log('\nAll page errors:');
    errors.forEach(e => console.log(' -', e));
  }
  
  await browser.close();
})();
