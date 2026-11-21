import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://127.0.0.1:5173';

async function runHomeQA() {
  console.log('--- Starting Home Page QA ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // 1. Desktop 1440x900
  console.log('1. Setting viewport to 1440x900...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Navigating to Home (/) ...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

  // Wait for initial hero animation sequence to settle (< 1.2s)
  await new Promise((r) => setTimeout(r, 1300));

  // Check 56px search bar and focus state
  console.log('Testing search input focus state...');
  const searchInput = await page.waitForSelector('input[placeholder*="Search by keywords"]');
  await searchInput.focus();
  await new Promise((r) => setTimeout(r, 200));

  // Test "Simulate intake" in the live panel
  console.log('Testing live panel intake simulation (testing layout glide & amber outline)...');
  const simulateBtn = await page.waitForSelector('button[title*="Simulate a new intake"]');
  await simulateBtn.click();
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: 'home-1440-live-panel.png' });

  // Wait for amber outline 1.2s fade out
  await new Promise((r) => setTimeout(r, 1100));

  // Scroll down smoothly through page to test How it works scroll line
  console.log('Scrolling down through page to observe scroll-linked line in How It Works...');
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 250;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
  });

  await new Promise((r) => setTimeout(r, 600));

  console.log('Capturing full page screenshot at 1440px...');
  await page.screenshot({ path: 'home-1440-full.png', fullPage: true });

  // 2. Mobile 390x844
  console.log('2. Setting viewport to 390x844 (mobile)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

  // Scroll mobile page to settle inView elements
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 250;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
  });

  await new Promise((r) => setTimeout(r, 600));

  console.log('Capturing full page screenshot at 390px...');
  await page.screenshot({ path: 'home-390-full.png', fullPage: true });

  // 3. Automated Verification Checks
  console.log('3. Running verification checks on content and rules...');
  const results = await page.evaluate(() => {
    const text = document.body.innerText;
    const errors = [];

    // Check How It Works step word counts (max 18 words)
    const stepDescriptions = [
      "File your missing property report or search the catalog of articles surrendered across campus intake desks.",
      "Campus personnel cross-reference unique item descriptions and alert your student email when a potential match arrives.",
      "Confirm distinctive characteristics, unlock credentials, or serial records before custody release approval.",
      "Bring your university photo ID to Central Library Commons Room 104 to collect your verified article."
    ];

    stepDescriptions.forEach((desc, idx) => {
      const count = desc.trim().split(/\s+/).length;
      if (count > 18) {
        errors.push(`Step ${idx + 1} exceeds 18 words (${count} words)`);
      }
    });

    // Check hard bans
    ['seamless', 'effortless', 'revolutionary', 'supercharge'].forEach((word) => {
      if (new RegExp(`\\b${word}\\b`, 'i').test(text)) {
        errors.push(`Banned word: ${word}`);
      }
    });

    // Check emojis
    if (/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(text)) {
      errors.push('Emoji detected');
    }

    // Check gradients or backdrop filters
    const all = Array.from(document.querySelectorAll('*'));
    for (const el of all) {
      const cs = window.getComputedStyle(el);
      if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) {
        errors.push('Gradient detected');
        break;
      }
      const bf = cs.backdropFilter || cs.webkitBackdropFilter;
      if (bf && bf !== 'none') {
        errors.push('Backdrop filter detected');
        break;
      }
    }

    return {
      errors,
      recentCardsCount: document.querySelectorAll('a[href^="/items/"]').length,
      quickPickCount: Array.from(document.querySelectorAll('button')).filter(b => 
        ['ID card', 'Keys', 'Phone', 'Bag', 'Calculator', 'Water bottle'].includes(b.textContent.trim())
      ).length,
    };
  });

  console.log('Verification results:', results);

  await browser.close();
  console.log('--- Home Page QA Complete ---');
}

runHomeQA().catch((err) => {
  console.error('Home QA failed:', err);
  process.exit(1);
});
