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
    console.log('Navigating to app...');
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
    
    console.log('Logged in. Navigating to Messages...');
    
    // Navigate to Messages
    const messagesBtn = page.locator('button:has-text("الرسائل")');
    await messagesBtn.first().click();
    await page.waitForTimeout(3000);
    
    // Now find and click on the More/broadcast section
    const bodyText = await page.locator('body').innerText();
    
    // Check for export/import section
    if (bodyText.includes('تصدير') && bodyText.includes('استيراد')) {
      console.log('SUCCESS: Export/Import section found!');
    } else {
      console.log('Export/Import section not directly visible. Checking sub-tabs...');
    }
    
    // Look for broadcast sub-tab or similar
    const broadcastBtn = page.locator('button:has-text("نسخ"), button:has-text("تصدير"), button:has-text("استيراد"), button:has-text("broadcast")');
    const count = await broadcastBtn.count();
    console.log('Found', count, 'export/import related buttons');
    
    // Let's check all buttons
    const allButtons = await page.locator('button').allTextContents();
    console.log('All buttons on page:', allButtons.slice(0, 30).join(' | '));
    
    // Take a screenshot
    await page.screenshot({ path: '/home/z/my-project/download/messages-section.png', fullPage: false });
    console.log('Screenshot saved to /home/z/my-project/download/messages-section.png');
    
  } catch (e) {
    console.error('Test error:', e.message);
  }

  if (errors.length > 0) {
    console.log('\n--- BROWSER ERRORS ---');
    errors.forEach(err => console.log('  -', err));
  } else {
    console.log('\nNo browser errors detected');
  }

  await browser.close();
})();
