const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    await page.goto('https://my-project-self-eight-86.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Step 1: Click doctor
    const btns1 = await page.$$('button');
    for (const b of btns1) {
      const t = await b.textContent();
      if (t && t.includes('طبيب')) {
        console.log('Clicking doctor...');
        await b.click();
        break;
      }
    }
    await page.waitForTimeout(3000);

    // Step 2: Enter password
    const inputs = await page.$$('input');
    console.log(`Found ${inputs.length} inputs`);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const placeholder = await inp.getAttribute('placeholder');
      console.log(`  Input: type=${type}, placeholder=${placeholder}`);
      if (type === 'password') {
        console.log('Filling password...');
        await inp.fill('2137');
        await page.waitForTimeout(500);
      }
    }

    // Step 3: Click submit
    const btns2 = await page.$$('button');
    for (const b of btns2) {
      const t = await b.textContent();
      if (t && (t.includes('دخول'))) {
        console.log('Clicking login button: "' + t.trim().substring(0, 20) + '"');
        await b.click();
        break;
      }
    }
    await page.waitForTimeout(8000);

    const afterLogin = await page.evaluate(() => document.body.innerText.substring(0, 300));
    console.log('After login:', afterLogin);

    // Step 4: Click More
    const btns3 = await page.$$('button');
    for (const b of btns3) {
      const t = await b.textContent();
      if (t && t.includes('المزيد')) {
        console.log('Clicking More...');
        await b.click();
        break;
      }
    }
    await page.waitForTimeout(8000);

    const afterMore = await page.evaluate(() => document.body.innerText.substring(0, 300));
    const hasError = afterMore.includes('حدث خطأ');
    console.log('Has error:', hasError);
    console.log('After More:', afterMore.substring(0, 200));

  } catch (e) {
    console.log('Test error:', e.message);
  }
  await browser.close();
})();
