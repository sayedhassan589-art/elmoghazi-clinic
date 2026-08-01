const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('PAGE ERROR:', err.message.substring(0, 200));
  });
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text().substring(0, 200));
  });
  
  console.log('1. Navigating...');
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
  
  console.log('2. Clicking المزيد...');
  await page.locator('button:has-text("المزيد")').first().click();
  await page.waitForTimeout(8000);
  
  await page.screenshot({ path: '/home/z/my-project/download/more-section-test.png', fullPage: true });
  
  const bodyText = await page.locator('body').textContent();
  const hasError = bodyText.includes('حدث خطأ') || bodyText.includes('Cannot access') || bodyText.includes('before initialization') || bodyText.includes('Cannot read properties of undefined');
  
  if (hasError) {
    console.log('❌ ERROR STILL PRESENT!');
    // Extract the error text
    const errorPatterns = ['حدث خطأ', 'Cannot access', 'before initialization', 'Cannot read properties'];
    for (const p of errorPatterns) {
      if (bodyText.includes(p)) {
        const idx = bodyText.indexOf(p);
        console.log(`  "${p}" at: ...${bodyText.substring(Math.max(0, idx-30), idx+p.length+80)}...`);
      }
    }
  } else {
    console.log('✅ More section loaded WITHOUT errors!');
  }
  
  // Check for actual content
  const hasContent = bodyText.includes('الخدمات') || bodyText.includes('المتابعات') || bodyText.includes('إيراد') || bodyText.includes('خدمات');
  console.log(hasContent ? '✅ Content is rendering!' : '⚠️ No content visible');
  
  if (errors.length > 0) {
    console.log('\nPage errors during test:');
    errors.forEach(e => console.log(' -', e.substring(0, 150)));
  } else {
    console.log('\nNo page errors!');
  }
  
  await browser.close();
})();
