const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('PAGE ERROR:', err.message);
  });
  
  console.log('1. Navigating to app...');
  await page.goto('https://my-project-self-eight-86.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Click doctor role button
  console.log('2. Selecting doctor role...');
  const doctorBtn = page.locator('button').filter({ hasText: /طبيب/ }).first();
  await doctorBtn.click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: '/home/z/my-project/download/step2-role-selected.png', fullPage: true });
  
  // Fill password
  console.log('3. Entering password...');
  const pwInput = page.locator('input[type="password"]').first();
  await pwInput.fill('2137');
  await page.waitForTimeout(500);
  
  // Click submit/enter
  const submitBtn = page.locator('button[type="submit"], button:has-text("دخول")').first();
  if (await submitBtn.count() > 0) {
    await submitBtn.click();
  } else {
    await page.keyboard.press('Enter');
  }
  await page.waitForTimeout(5000);
  
  await page.screenshot({ path: '/home/z/my-project/download/step3-logged-in.png', fullPage: true });
  
  // Find and click More tab
  console.log('4. Looking for المزيد tab...');
  const allBtns = await page.locator('button').all();
  for (let i = 0; i < allBtns.length; i++) {
    const text = (await allBtns[i].textContent() || '').trim();
    if (text.length < 30 && text.length > 0) console.log(`  Btn ${i}: "${text}"`);
  }
  
  // Try to find المزيد
  const moreBtn = page.locator('button:has-text("المزيد")').first();
  if (await moreBtn.count() > 0) {
    console.log('5. Clicking المزيد tab...');
    await moreBtn.click();
    await page.waitForTimeout(8000);
    
    await page.screenshot({ path: '/home/z/my-project/download/step4-more-section.png', fullPage: true });
    
    const pageContent = await page.content();
    const hasError = pageContent.includes('حدث خطأ') || pageContent.includes('Cannot access') || pageContent.includes('before initialization');
    console.log(hasError ? '❌ ERROR STILL PRESENT in More section!' : '✅ More section loaded WITHOUT errors!');
    
    // Check for specific content that shows the section is working
    const hasStats = pageContent.includes('إيراد') || pageContent.includes('مصروف') || pageContent.includes('إجمالي') || pageContent.includes('خدمات');
    console.log(hasStats ? '✅ More section content is rendering!' : '⚠️ More section may not be rendering content');
  } else {
    console.log('❌ المزيد tab not found!');
  }
  
  if (errors.length > 0) {
    console.log('\nPage errors during test:');
    errors.forEach(e => console.log(' -', e));
  } else {
    console.log('\nNo page errors detected!');
  }
  
  await browser.close();
})();
