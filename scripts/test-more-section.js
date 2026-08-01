const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Collect console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  
  console.log('1. Navigating to app...');
  await page.goto('https://my-project-self-eight-86.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // Login
  console.log('2. Logging in...');
  const passwordInput = page.locator('input[type="password"], input[placeholder*="كلمة"], input[placeholder*="رقم"]');
  if (await passwordInput.count() > 0) {
    await passwordInput.first().fill('2137');
    await page.waitForTimeout(500);
    // Click submit button
    const submitBtn = page.locator('button:has-text("دخول"), button:has-text("تسجيل"), button[type="submit"]').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }
    await page.waitForTimeout(3000);
  }
  
  console.log('3. Looking for More tab...');
  await page.waitForTimeout(2000);
  
  // Take screenshot before clicking More
  await page.screenshot({ path: '/home/z/my-project/download/before-more.png' });
  
  // Click on المزيد (More) tab
  const moreTab = page.locator('button:has-text("المزيد"), [data-tab="more"]').first();
  if (await moreTab.count() > 0) {
    console.log('4. Clicking More tab...');
    await moreTab.click();
    await page.waitForTimeout(5000);
    
    // Take screenshot after clicking More
    await page.screenshot({ path: '/home/z/my-project/download/after-more.png' });
    
    // Check for error text
    const errorText = await page.locator('text=حدث خطأ').count();
    const cannotAccess = await page.locator('text=Cannot access').count();
    const beforeInit = await page.locator('text=before initialization').count();
    
    if (errorText > 0 || cannotAccess > 0 || beforeInit > 0) {
      console.log('❌ ERROR STILL PRESENT on More section!');
      console.log('Error text found:', errorText, 'Cannot access:', cannotAccess, 'Before init:', beforeInit);
    } else {
      console.log('✅ More section loaded without errors!');
    }
    
    // Check for any rendered content in the More section
    const contentElements = await page.locator('[class*="card"], [class*="Card"], [class*="section"]').count();
    console.log('Content elements found:', contentElements);
    
  } else {
    console.log('More tab not found, trying to find any tab...');
    const tabs = await page.locator('button[role="tab"], nav button').allTextContents();
    console.log('Available tabs:', tabs);
  }
  
  if (errors.length > 0) {
    console.log('\nConsole errors:');
    errors.slice(0, 10).forEach(e => console.log(' -', e));
  } else {
    console.log('\nNo console errors!');
  }
  
  await browser.close();
})();
