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
    
    // Navigate to More section
    const moreBtn = page.locator('button:has-text("المزيد")');
    await moreBtn.first().click();
    await page.waitForTimeout(5000);
    
    // Get the error message from the error boundary
    const bodyText = await page.locator('body').innerText();
    console.log('FULL PAGE TEXT:', bodyText);
    
    // Check for error message element
    const errorText = await page.locator('p').allTextContents();
    console.log('All paragraphs:', errorText.join('\n'));
    
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
