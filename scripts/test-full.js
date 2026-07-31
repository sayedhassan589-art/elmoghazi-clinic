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
    console.log('1. Loading app...');
    await page.goto('https://my-project-self-eight-86.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Login as doctor
    console.log('2. Logging in as doctor...');
    const doctorBtn = page.locator('button:has-text("طبيب")');
    await doctorBtn.first().click();
    await page.waitForTimeout(1000);
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('2137');
    await page.waitForTimeout(500);
    
    const loginBtn = page.locator('button:has-text("دخول")');
    await loginBtn.click();
    await page.waitForTimeout(5000);
    
    const bodyText = await page.locator('body').innerText();
    if (bodyText.includes('مرحباً') || bodyText.includes('لوحة التحكم')) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed:', bodyText.substring(0, 200));
    }
    
    // Test Messages tab
    console.log('3. Testing Messages tab...');
    const messagesBtn = page.locator('button:has-text("الرسائل")');
    await messagesBtn.first().click();
    await page.waitForTimeout(3000);
    
    const messagesText = await page.locator('body').innerText();
    if (messagesText.includes('قسم الرسائل') || messagesText.includes('واتساب')) {
      console.log('✅ Messages tab works!');
    } else {
      console.log('❌ Messages tab failed:', messagesText.substring(0, 200));
    }
    
    // Test More section
    console.log('4. Testing More section...');
    const moreBtn = page.locator('button:has-text("المزيد")');
    await moreBtn.first().click();
    await page.waitForTimeout(3000);
    
    const moreText = await page.locator('body').innerText();
    if (moreText.includes('حدوث خطأ') || moreText.includes('Application error')) {
      console.log('❌ More section has error:', moreText.substring(0, 300));
    } else {
      console.log('✅ More section works!');
    }
    
    // Test Dashboard
    console.log('5. Testing Dashboard...');
    const homeBtn = page.locator('button:has-text("الرئيسية")');
    await homeBtn.first().click();
    await page.waitForTimeout(3000);
    
    const dashText = await page.locator('body').innerText();
    if (dashText.includes('لوحة التحكم')) {
      console.log('✅ Dashboard works!');
    }
    
    // Test Patients tab
    console.log('6. Testing Patients tab...');
    const patientsBtn = page.locator('button:has-text("المرضى")');
    await patientsBtn.first().click();
    await page.waitForTimeout(3000);
    
    const patientsText = await page.locator('body').innerText();
    if (patientsText.includes('مريض') || patientsText.includes('المرضى')) {
      console.log('✅ Patients tab works!');
    }
    
    console.log('\n=== FULL TEST COMPLETE ===');
    
  } catch (e) {
    console.error('Test error:', e.message);
  }

  if (errors.length > 0) {
    console.log('\n--- BROWSER ERRORS ---');
    errors.forEach(err => console.log('  -', err));
  } else {
    console.log('\n✅ No browser errors detected');
  }

  await browser.close();
})();
