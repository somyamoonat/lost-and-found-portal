import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://127.0.0.1:5173';

async function runShellQA() {
  console.log('--- Starting App Shell QA ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // 1. Desktop Test (1440x900)
  console.log('1. Setting viewport to 1440x900...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // A. Home Route (/)
  console.log('Navigating to / (Home)...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: 'shell-1440-home.png', fullPage: true });

  // B. Scroll Navbar Test (ease from 76px to 60px, 1px border fade in)
  console.log('Testing sticky navbar scroll animation (scrollY = 80px)...');
  await page.evaluate(() => window.scrollTo(0, 80));
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: 'shell-1440-navbar-scrolled.png' });
  const navProps = await page.evaluate(() => {
    const header = document.querySelector('header');
    const style = window.getComputedStyle(header);
    return {
      height: style.height,
      position: style.position,
      boxShadow: style.boxShadow,
      backdropFilter: style.backdropFilter,
    };
  });
  console.log('Navbar computed style after scroll:', navProps);

  // C. Browse Route (/browse)
  console.log('Navigating to /browse...');
  await page.goto(`${BASE_URL}/browse`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: 'shell-1440-browse.png', fullPage: true });

  // D. Scroll Restoration Test between /browse and /items/2041
  console.log('Testing scroll restoration: scrolling /browse down by 350px...');
  await page.evaluate(() => window.scrollTo(0, 350));
  await new Promise((r) => setTimeout(r, 200));

  console.log('Navigating to /items/2041...');
  const itemLink = await page.waitForSelector('a[href="/items/2041"]');
  await itemLink.click();
  await new Promise((r) => setTimeout(r, 600));
  const itemScrollY = await page.evaluate(() => window.scrollY);
  console.log('Scroll position on /items/2041 (expected 0):', itemScrollY);
  await page.screenshot({ path: 'shell-1440-item.png', fullPage: true });

  console.log('Navigating back to /browse...');
  const backLink = await page.waitForSelector('a[href="/browse"]');
  await backLink.click();
  await new Promise((r) => setTimeout(r, 600));
  const restoredScrollY = await page.evaluate(() => window.scrollY);
  console.log('Restored scroll position on /browse (expected ~350):', restoredScrollY);

  // E. Report Route (/report)
  console.log('Navigating to /report...');
  await page.goto(`${BASE_URL}/report`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: 'shell-1440-report.png', fullPage: true });

  // F. My Reports Route (/my-reports)
  console.log('Navigating to /my-reports...');
  await page.goto(`${BASE_URL}/my-reports`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: 'shell-1440-my-reports.png', fullPage: true });

  // G. Admin Route (/admin)
  console.log('Navigating to /admin...');
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: 'shell-1440-admin.png', fullPage: true });

  // H. Sign In Route (/sign-in)
  console.log('Navigating to /sign-in...');
  await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: 'shell-1440-signin.png', fullPage: true });

  // I. 404 Route (/non-existent-page)
  console.log('Navigating to /missing-page-test (404)...');
  await page.goto(`${BASE_URL}/missing-page-test`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: 'shell-1440-404.png', fullPage: true });

  // 2. Mobile Viewport Tests (390x844)
  console.log('2. Setting viewport to 390x844 (mobile)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: 'shell-390-home.png', fullPage: true });

  console.log('Navigating to /browse on mobile...');
  await page.goto(`${BASE_URL}/browse`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: 'shell-390-browse.png', fullPage: true });

  // Test Mobile Menu & Morphing Hamburger
  console.log('Opening mobile navigation drawer...');
  const menuButton = await page.waitForSelector('button[aria-label="Open navigation menu"]');
  await menuButton.click();
  await new Promise((r) => setTimeout(r, 450));
  await page.screenshot({ path: 'shell-390-mobile-menu.png' });

  const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
  console.log('Body overflow with drawer open (expected "hidden"):', bodyOverflow);

  // Test Escape Key Closes Mobile Menu
  console.log('Testing Escape key to close mobile drawer...');
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 350));
  const drawerStillOpen = await page.evaluate(() => Boolean(document.querySelector('div[aria-label="Close navigation"]')));
  console.log('Drawer still open after Escape (expected false):', drawerStillOpen);

  // 3. 404 Page on Mobile
  console.log('Testing 404 page on mobile...');
  await page.goto(`${BASE_URL}/unknown-item-url`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: 'shell-390-404.png', fullPage: true });

  // 4. Reduced Motion Test
  console.log('4. Emulating prefers-reduced-motion: reduce...');
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(`${BASE_URL}/browse`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 300));
  await page.goto(`${BASE_URL}/report`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 300));
  console.log('Navigations under reduced motion completed without errors.');

  // 5. Hard Bans Audit
  console.log('5. Auditing against HARD BANS across entire app shell...');
  const audit = await page.evaluate(() => {
    const text = document.body.innerText;
    const violations = [];

    // Banned AI words
    ['seamless', 'effortless', 'revolutionary', 'supercharge'].forEach((word) => {
      if (new RegExp(`\\b${word}\\b`, 'i').test(text)) {
        violations.push(`Banned word found: ${word}`);
      }
    });

    // Banned emojis
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(text)) {
      violations.push('Emoji character found');
    }

    // Computed style checks for all elements
    const all = Array.from(document.querySelectorAll('*'));
    for (const el of all) {
      const cs = window.getComputedStyle(el);
      if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) {
        violations.push('Gradient background detected');
        break;
      }
      const bf = cs.backdropFilter || cs.webkitBackdropFilter;
      if (bf && bf !== 'none') {
        violations.push('Backdrop filter / glassmorphism detected');
        break;
      }
    }

    return violations;
  });

  console.log('Hard bans audit violations:', audit);

  await browser.close();
  console.log('--- App Shell QA Complete ---');
}

runShellQA().catch((err) => {
  console.error('QA failed with error:', err);
  process.exit(1);
});
