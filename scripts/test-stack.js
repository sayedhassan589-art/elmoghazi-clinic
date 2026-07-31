const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

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
    
    // Get the error stack trace
    const preText = await page.locator('pre').textContent().catch(() => 'No stack trace found');
    console.log('Stack trace:', preText);
    
    const bodyText = await page.locator('body').innerText();
    console.log('Full text:', bodyText.substring(0, 1000));
    
  } catch (e) {
    console.error('Test error:', e.message);
  }

  await browser.close();
})();
