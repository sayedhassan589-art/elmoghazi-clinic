const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console error: ${msg.text()}`);
    }
  });

  try {
    console.log('Navigating to https://my-project-self-eight-86.vercel.app...');
    await page.goto('https://my-project-self-eight-86.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait a bit for any async rendering
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    console.log('Page title:', title);
    
    const bodyText = await page.locator('body').innerText();
    console.log('Body text (first 500 chars):', bodyText.substring(0, 500));
    
    // Check for error page
    if (bodyText.includes('Application error') || bodyText.includes('client-side exception')) {
      console.log('ERROR: Application error detected on page!');
    }
    
    // Check for login page
    if (bodyText.includes('طبيب') || bodyText.includes('Elmoghazi Clinic')) {
      console.log('SUCCESS: Login page is showing');
    }
    
    // Try to login as doctor
    console.log('\nTrying to login as doctor...');
    const doctorBtn = page.locator('button:has-text("طبيب")');
    if (await doctorBtn.count() > 0) {
      await doctorBtn.first().click();
      await page.waitForTimeout(1000);
      
      // Enter password
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.count() > 0) {
        await passwordInput.fill('2137');
        await page.waitForTimeout(500);
        
        // Click login button
        const loginBtn = page.locator('button:has-text("دخول")');
        if (await loginBtn.count() > 0) {
          await loginBtn.click();
          await page.waitForTimeout(5000);
          
          const afterLogin = await page.locator('body').innerText();
          console.log('After login (first 500 chars):', afterLogin.substring(0, 500));
          
          if (afterLogin.includes('لوحة التحكم') || afterLogin.includes('مرحباً')) {
            console.log('SUCCESS: Logged in successfully!');
          } else if (afterLogin.includes('Application error')) {
            console.log('ERROR: Application error after login!');
          }
        }
      }
    }
    
    // Navigate to Messages tab
    console.log('\nTrying to navigate to Messages tab...');
    const messagesBtn = page.locator('button:has-text("الرسائل")');
    if (await messagesBtn.count() > 0) {
      await messagesBtn.first().click();
      await page.waitForTimeout(3000);
      
      const afterMessages = await page.locator('body').innerText();
      console.log('After Messages (first 500 chars):', afterMessages.substring(0, 500));
    } else {
      console.log('Messages button not found');
    }
    
  } catch (e) {
    console.error('Test error:', e.message);
  }

  // Report errors
  if (errors.length > 0) {
    console.log('\n--- BROWSER ERRORS ---');
    errors.forEach(err => console.log('  -', err));
  } else {
    console.log('\nNo browser errors detected');
  }

  await browser.close();
})();
