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
  
  await page.screenshot({ path: '/home/z/my-project/download/step1-landing.png', fullPage: true });
  
  // Try to find and fill the password field
  const allInputs = await page.locator('input').all();
  console.log('Inputs found:', allInputs.length);
  for (let i = 0; i < allInputs.length; i++) {
    const type = await allInputs[i].getAttribute('type');
    const placeholder = await allInputs[i].getAttribute('placeholder');
    console.log(`  Input ${i}: type=${type}, placeholder=${placeholder}`);
  }
  
  // Fill password
  const pwInput = page.locator('input[type="password"]').first();
  if (await pwInput.count() > 0) {
    console.log('2. Filling password...');
    await pwInput.fill('2137');
    await page.waitForTimeout(500);
    
    // Try clicking the login button
    const buttons = await page.locator('button').all();
    console.log('Buttons found:', buttons.length);
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent();
      console.log(`  Button ${i}: "${text}"`);
    }
    
    const loginBtn = page.locator('button').filter({ hasText: /دخول|تسجيل|Login|Enter/ }).first();
    if (await loginBtn.count() > 0) {
      console.log('3. Clicking login...');
      await loginBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }
    await page.waitForTimeout(5000);
  }
  
  await page.screenshot({ path: '/home/z/my-project/download/step2-after-login.png', fullPage: true });
  
  // Now find the More tab
  console.log('4. Looking for tabs...');
  const allButtons = await page.locator('button').all();
  for (let i = 0; i < allButtons.length; i++) {
    const text = (await allButtons[i].textContent() || '').trim();
    if (text) console.log(`  Btn ${i}: "${text}"`);
  }
  
  // Try various selectors for المزيد
  const moreSelectors = [
    'button:has-text("المزيد")',
    'text=المزيد',
    '[data-tab="more"]',
    'button >> text=المزيد',
  ];
  
  let moreClicked = false;
  for (const sel of moreSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.count() > 0) {
        console.log(`5. Found More tab with selector: ${sel}`);
        await el.click();
        moreClicked = true;
        break;
      }
    } catch (e) {}
  }
  
  if (!moreClicked) {
    // Try to find tab-like elements
    console.log('Trying broader search for tab elements...');
    const tabEls = await page.locator('[role="tab"], nav button, [class*="tab"]').all();
    console.log('Tab elements:', tabEls.length);
    for (let i = 0; i < tabEls.length; i++) {
      const text = (await tabEls[i].textContent() || '').trim();
      console.log(`  Tab ${i}: "${text}"`);
    }
    
    // Click on the last tab (More is usually last)
    if (tabEls.length > 0) {
      const lastTab = tabEls[tabEls.length - 1];
      const text = (await lastTab.textContent() || '').trim();
      console.log(`5. Clicking last tab: "${text}"`);
      await lastTab.click();
      moreClicked = true;
    }
  }
  
  if (moreClicked) {
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/home/z/my-project/download/step3-more-section.png', fullPage: true });
    
    // Check for error
    const pageContent = await page.content();
    const hasError = pageContent.includes('حدث خطأ') || pageContent.includes('Cannot access') || pageContent.includes('before initialization');
    console.log(hasError ? '❌ ERROR STILL PRESENT!' : '✅ More section loaded without errors!');
  }
  
  if (errors.length > 0) {
    console.log('\nPage errors:');
    errors.forEach(e => console.log(' -', e));
  } else {
    console.log('\nNo page errors detected!');
  }
  
  await browser.close();
})();
