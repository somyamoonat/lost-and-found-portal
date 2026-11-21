import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://127.0.0.1:5173/styleguide';

async function runQA() {
  console.log('Starting Browser QA with puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // 1. Desktop Test (1440x900)
  console.log('Setting viewport to 1440x900...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

  // Scroll through page to trigger all inView reveals
  console.log('Scrolling through page to trigger all reveal animations...');
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 50);
    });
  });

  // Wait a moment for spring animations to settle
  await new Promise((r) => setTimeout(r, 600));

  console.log('Capturing full page screenshot at 1440px...');
  await page.screenshot({ path: 'styleguide-1440-full.png', fullPage: true });

  // 2. Interactive Testing at 1440px
  console.log('Testing interactive AnimatedNumber (+10)...');
  const plusTenBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.textContent.includes('+10'));
  });
  if (plusTenBtn) {
    await plusTenBtn.click();
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log('Testing status chip cycle...');
  const cycleChipBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.textContent.includes('Cycle dynamic chip state'));
  });
  if (cycleChipBtn) {
    await cycleChipBtn.click();
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log('Testing Toast notification trigger...');
  const toastBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.textContent.includes('Trigger report toast'));
  });
  if (toastBtn) {
    await toastBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: 'styleguide-1440-toast.png' });
  }

  console.log('Testing Dialog modal open...');
  const dialogBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.textContent.includes('Open release verification modal'));
  });
  if (dialogBtn) {
    await dialogBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: 'styleguide-1440-dialog.png' });
    
    // Close dialog
    const cancelBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find((b) => b.textContent.trim() === 'Cancel');
    });
    if (cancelBtn) {
      await cancelBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  console.log('Testing Sheet drawer open...');
  const sheetBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.textContent.includes('Open desk schedule drawer'));
  });
  if (sheetBtn) {
    await sheetBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: 'styleguide-1440-sheet.png' });

    // Close sheet
    const closeSheetBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find((b) => b.textContent.includes('Close schedule drawer'));
    });
    if (closeSheetBtn) {
      await closeSheetBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  // 3. Mobile Viewport (390x844)
  console.log('Setting viewport to 390x844 (mobile)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

  console.log('Scrolling through mobile page...');
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 50);
    });
  });

  await new Promise((r) => setTimeout(r, 600));

  console.log('Capturing full page screenshot at 390px...');
  await page.screenshot({ path: 'styleguide-390-full.png', fullPage: true });

  // 4. Ban Audit
  console.log('Auditing against hard bans...');
  const audit = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const issues = [];

    // Check banned words
    const bannedWords = ['seamless', 'effortless', 'revolutionary', 'supercharge'];
    bannedWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(bodyText)) {
        issues.push(`Found banned word: "${word}"`);
      }
    });

    // Check for emojis
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(bodyText)) {
      issues.push('Found emoji character in body text');
    }

    // Check all elements for gradient backgrounds or backdrop-filter
    const allElements = Array.from(document.querySelectorAll('*'));
    let hasGradient = false;
    let hasBackdropFilter = false;

    allElements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const bg = style.backgroundImage;
      if (bg && bg.includes('gradient')) {
        hasGradient = true;
      }
      const bf = style.backdropFilter || style.webkitBackdropFilter;
      if (bf && bf !== 'none') {
        hasBackdropFilter = true;
      }
    });

    if (hasGradient) issues.push('Detected gradient in computed styles');
    if (hasBackdropFilter) issues.push('Detected backdrop-filter / glassmorphism');

    return {
      issues,
      headingsCount: document.querySelectorAll('h1, h2, h3, h4').length,
      buttonsCount: document.querySelectorAll('button').length,
      inputsCount: document.querySelectorAll('input').length,
    };
  });

  console.log('Audit results:', JSON.stringify(audit, null, 2));

  await browser.close();
  console.log('Browser QA finished successfully.');
}

runQA().catch((err) => {
  console.error('QA Error:', err);
  process.exit(1);
});
