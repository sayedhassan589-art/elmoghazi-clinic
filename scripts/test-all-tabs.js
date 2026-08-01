const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  
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
  await page.waitForTimeout(3000);
  
  // Test each sub-tab
  const subTabs = ['المتابعات', 'الخدمات', 'الجلسات', 'الزيارات', 'الأطباء', 'المخزون', 'الحجز', 'الأدوية', 'التذكيرات', 'التقارير', 'الإعدادات'];
  
  for (const tab of subTabs) {
    const tabBtn = page.locator(`button:has-text("${tab}")`).first();
    if (await tabBtn.count() > 0) {
      console.log(`Testing tab: ${tab}`);
      await tabBtn.click();
      await page.waitForTimeout(3000);
      
      const bodyText = await page.locator('body').textContent();
      const hasError = bodyText.includes('حدث خطأ') || bodyText.includes('Cannot read') || bodyText.includes('is not defined');
      console.log(hasError ? `  ❌ ERROR in ${tab}!` : `  ✅ ${tab} OK`);
      
      if (hasError) {
        // Get the error message
        const errorPatterns = ['حدث خطأ', 'Cannot read', 'is not defined'];
        for (const p of errorPatterns) {
          if (bodyText.includes(p)) {
            const idx = bodyText.indexOf(p);
            console.log(`    Error: ${bodyText.substring(idx, idx + 100)}`);
          }
        }
      }
    } else {
      console.log(`  ⚠️ Tab ${tab} not found`);
    }
  }
  
  if (errors.length > 0) {
    console.log('\nPage errors:');
    errors.slice(0, 10).forEach(e => console.log(' -', e.substring(0, 150)));
  } else {
    console.log('\nNo page errors!');
  }
  
  await browser.close();
})();
