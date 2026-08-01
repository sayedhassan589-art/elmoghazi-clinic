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
    
    console.log('Logged in. Navigating to More section...');
    
    // Navigate to More section
    const moreBtn = page.locator('button:has-text("المزيد")');
    await moreBtn.first().click();
    await page.waitForTimeout(3000);
    
    const bodyText = await page.locator('body').innerText();
    console.log('More section loaded. Checking for broadcast tab...');
    
    // Find and click on the broadcast tab
    const broadcastTab = page.locator('button:has-text("نسخ"), button:has-text("Broadcast"), button:has-text("broadcast")');
    const count = await broadcastTab.count();
    console.log('Found', count, 'broadcast tab buttons');
    
    // List all buttons to find the broadcast sub-tab
    const allButtons = await page.locator('button').allTextContents();
    console.log('All buttons:', allButtons.slice(0, 50).join(' | '));
    
    // Take a screenshot
    await page.screenshot({ path: '/home/z/my-project/download/more-section.png', fullPage: false });
    console.log('Screenshot saved');
    
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
