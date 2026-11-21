import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://127.0.0.1:5173';
const ARTIFACT_DIR = '/Users/somya_moonat/.gemini/antigravity/brain/ae480934-05a2-4df3-8623-0ddd4b3f1a0a';

async function waitForData(page) {
  await page.waitForFunction(() => {
    const isLoading = document.querySelector('[data-testid="loading-skeletons"]');
    const cards = document.querySelectorAll('a[href^="/items/"]');
    const emptyState = document.querySelector('[data-testid="empty-report-btn"]');
    if (isLoading) return false;
    return cards.length > 0 || emptyState !== null;
  }, { timeout: 10000 });
  // Allow soft spring / animated number counter to settle
  await new Promise((r) => setTimeout(r, 600));
}

async function takeScreenshot(page, filename, options = {}) {
  await page.screenshot({ path: filename, ...options });
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(filename, `${ARTIFACT_DIR}/${filename}`);
  }
}

async function runBrowseQA() {
  console.log('--- Starting /browse QA ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // 1. Desktop 1440x900
  console.log('1. Setting viewport to 1440x900...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Navigating to /browse...');
  await page.goto(`${BASE_URL}/browse`, { waitUntil: 'networkidle0' });
  await waitForData(page);

  const initialCount = await page.evaluate(() => document.querySelectorAll('a[href^="/items/"]').length);
  const headerCount = await page.evaluate(() => document.querySelector('h1')?.innerText.trim().replace(/\s+/g, ' '));
  console.log(`Initial items rendered: ${initialCount}, Header: "${headerCount}"`);

  console.log('Capturing default /browse at 1440px...');
  await takeScreenshot(page, 'browse-1440-default.png', { fullPage: true });

  // Test "Load more" button
  console.log('Testing "Load more" button...');
  const clickedLoadMore = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent.includes('Load more'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  if (clickedLoadMore) {
    await waitForData(page);
    const countAfterLoadMore = await page.evaluate(() => document.querySelectorAll('a[href^="/items/"]').length);
    console.log(`Cards count after Load More: ${countAfterLoadMore} (was ${initialCount})`);
  }

  // Reload clean /browse for filter testing
  await page.goto(`${BASE_URL}/browse`, { waitUntil: 'networkidle0' });
  await waitForData(page);

  // Test Status Segmented Control (Lost)
  console.log('Testing Status segmented control: clicking "Lost"...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent.trim() === 'Lost');
    if (btn) btn.click();
  });
  await waitForData(page);
  console.log('Current URL after clicking Lost:', page.url());

  // Test Category Multi-Select
  console.log('Testing category multi-select chips: clicking "Electronics"...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent.includes('Electronics'));
    if (btn) btn.click();
  });
  await waitForData(page);
  console.log('Current URL after selecting category:', page.url());

  // Search input typing with debounce verification
  console.log('Testing search query input: typing "calculator"...');
  const searchInput = await page.waitForSelector('input[placeholder*="Search keywords"]');
  await searchInput.click();
  await searchInput.type('calculator');
  // Wait for 250ms debounce + simulated network latency
  await new Promise((r) => setTimeout(r, 400));
  await waitForData(page);
  console.log('Current URL after search query:', page.url());
  await takeScreenshot(page, 'browse-1440-filtered.png', { fullPage: true });

  // Test List View Toggle
  console.log('Testing view mode toggle to List...');
  const listViewBtn = await page.waitForSelector('button[aria-label="List view"]');
  await listViewBtn.click();
  await new Promise((r) => setTimeout(r, 600)); // Layout morph animation duration
  console.log('Current URL after list view toggle:', page.url());
  await takeScreenshot(page, 'browse-1440-list-view.png', { fullPage: true });

  // Toggle back to Grid
  const gridViewBtn = await page.waitForSelector('button[aria-label="Grid view"]');
  await gridViewBtn.click();
  await new Promise((r) => setTimeout(r, 400));

  // Test Empty State & "Report this item as lost" prefill
  console.log('Testing Empty State...');
  await page.goto(`${BASE_URL}/browse?q=completely_unknown_item_query_999`, { waitUntil: 'networkidle0' });
  await waitForData(page);
  await takeScreenshot(page, 'browse-1440-empty.png', { fullPage: true });

  console.log('Clicking "Report this item as lost"...');
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="empty-report-btn"]');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  console.log('Navigated URL from empty state:', page.url());
  const prefilledValue = await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Herschel"]');
    return input ? input.value : '';
  });
  console.log('Prefilled title in /report:', prefilledValue);

  // 2. Mobile 390x844
  console.log('2. Setting viewport to 390x844 (mobile)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(`${BASE_URL}/browse`, { waitUntil: 'networkidle0' });
  await waitForData(page);

  console.log('Capturing mobile /browse default...');
  await takeScreenshot(page, 'browse-390-default.png', { fullPage: true });

  // Open mobile bottom filter sheet
  console.log('Opening mobile bottom filter sheet...');
  const openedSheet = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent.includes('Filters'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (openedSheet) {
    await new Promise((r) => setTimeout(r, 600));

    // Check live number update inside sticky button
    const stickyButtonText = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="mobile-sheet-apply-btn"]');
      return btn ? btn.textContent.trim().replace(/\s+/g, ' ') : '';
    });
    console.log('Mobile sheet initial sticky button text:', stickyButtonText);
    await takeScreenshot(page, 'browse-390-sheet.png');

    // Click "Lost" status in sheet to verify live updating number
    console.log('Filtering to "Lost" inside mobile sheet...');
    await page.evaluate(() => {
      const sheet = document.querySelector('[data-testid="mobile-sheet-apply-btn"]')?.closest('.fixed') || document.body;
      const buttons = Array.from(sheet.querySelectorAll('button'));
      const lostBtn = buttons.find((b) => b.textContent.trim().toLowerCase() === 'lost');
      if (lostBtn) lostBtn.click();
    });
    await waitForData(page);

    const updatedStickyButtonText = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="mobile-sheet-apply-btn"]');
      return btn ? btn.textContent.trim().replace(/\s+/g, ' ') : '';
    });
    console.log('Mobile sheet updated sticky button text:', updatedStickyButtonText);

    // Click sticky button to close sheet and view filtered items
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="mobile-sheet-apply-btn"]');
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 600));
    await waitForData(page);
    await takeScreenshot(page, 'browse-390-filtered.png', { fullPage: true });
  }

  // 3. Hard Bans Audit
  console.log('3. Running hard bans audit on /browse...');
  const violations = await page.evaluate(() => {
    const text = document.body.innerText;
    const errors = [];

    // Banned AI buzzwords
    ['seamless', 'effortless', 'revolutionary', 'supercharge'].forEach((word) => {
      if (new RegExp(`\\b${word}\\b`, 'i').test(text)) {
        errors.push(`Banned word: ${word}`);
      }
    });

    // Banned emojis
    if (/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(text)) {
      errors.push('Emoji detected');
    }

    // Check computed styles
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

    return errors;
  });

  console.log('Hard bans audit violations:', violations);

  await browser.close();
  console.log('--- /browse QA Complete ---');
}

runBrowseQA().catch((err) => {
  console.error('Browse QA failed:', err);
  process.exit(1);
});
