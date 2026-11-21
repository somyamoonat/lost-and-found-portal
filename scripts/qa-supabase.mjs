import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://127.0.0.1:5173';
const ARTIFACT_DIR = '/Users/somya_moonat/.gemini/antigravity/brain/ae480934-05a2-4df3-8623-0ddd4b3f1a0a';

async function takeScreenshot(page, filename, options = {}) {
  await page.screenshot({ path: filename, ...options });
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(filename, `${ARTIFACT_DIR}/${filename}`);
  }
  console.log(`Saved screenshot: ${filename}`);
}

async function runSupabaseQA() {
  console.log('=== Starting Supabase & Realtime QA Suite ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // --------------------------------------------------------------------------
  // TEST 1: Browse Realtime Notification Pill (Without shifting grid)
  // --------------------------------------------------------------------------
  console.log('\n--- Test 1: /browse Realtime Pill ---');
  await page.goto(`${BASE_URL}/browse`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => {
    return document.querySelectorAll('a[href^="/items/"]').length > 0;
  });

  const initialCardCount = await page.evaluate(
    () => document.querySelectorAll('a[href^="/items/"]').length
  );
  console.log(`Initial items in grid: ${initialCardCount}`);

  // Dispatch realtime event for a new item that matches current filter (all/open)
  console.log('Dispatching realtime new item event...');
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent('sju:new-item', {
        detail: {
          id: '9999',
          refCode: 'LF-9999',
          type: 'found',
          title: 'AirPods Pro in MagSafe Case (USB-C)',
          category: 'electronics',
          location: 'Main Library & Research Commons',
          buildingCode: 'MLC',
          occurredAt: new Date().toISOString(),
          status: 'open',
          description: 'White charging case with engraving on back.',
          timeAgo: 'Just now',
        },
      })
    );
  });

  // Verify that the sliding pill appears
  await page.waitForSelector('[data-testid="realtime-browse-pill"]', { timeout: 3000 });
  const pillText = await page.evaluate(
    () => document.querySelector('[data-testid="realtime-browse-pill"]')?.textContent?.trim()
  );
  console.log(`Pill appeared with label: "${pillText}"`);

  // Verify grid did NOT shift (count is unchanged before clicking pill)
  const countBeforeClick = await page.evaluate(
    () => document.querySelectorAll('a[href^="/items/"]').length
  );
  console.log(`Grid count before clicking pill (must be unchanged): ${countBeforeClick}`);
  if (countBeforeClick !== initialCardCount) {
    throw new Error('FAIL: Grid shifted before user clicked the pill!');
  }

  await takeScreenshot(page, 'supabase-browse-pill.png');

  // Click the pill to apply the new item
  console.log('Clicking realtime pill to apply new item...');
  await page.evaluate(() => {
    document.querySelector('[data-testid="realtime-browse-pill"]')?.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Verify pill disappears and new item is in the grid
  const hasLF9999 = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('LF-9999') && text.includes('AirPods Pro in MagSafe Case');
  });
  console.log(`Item LF-9999 present in grid after click: ${hasLF9999}`);
  if (!hasLF9999) {
    throw new Error('FAIL: LF-9999 was not prepended to the grid after clicking pill!');
  }

  await takeScreenshot(page, 'supabase-browse-applied.png');

  // --------------------------------------------------------------------------
  // TEST 2: Home Page Realtime New Item Animation
  // --------------------------------------------------------------------------
  console.log('\n--- Test 2: Home Page Realtime Intake Animation ---');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => {
    return document.querySelectorAll('a[href^="/items/"]').length > 0;
  });

  console.log('Dispatching realtime item for Home page intake...');
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent('sju:new-item', {
        detail: {
          id: '8888',
          refCode: 'LF-8888',
          type: 'found',
          title: 'Graphing Calculator TI-84 Plus CE (Mint)',
          category: 'electronics',
          location: 'Founders Engineering Hall',
          buildingCode: 'FEH',
          occurredAt: new Date().toISOString(),
          status: 'open',
          description: 'Left in Room 204 computer lab.',
          timeAgo: 'Just now',
        },
      })
    );
  });

  await new Promise((r) => setTimeout(r, 400));
  const homeHasLF8888 = await page.evaluate(() => {
    return document.body.innerText.includes('LF-8888');
  });
  console.log(`LF-8888 inserted in "Handed in today": ${homeHasLF8888}`);
  if (!homeHasLF8888) {
    throw new Error('FAIL: LF-8888 not found in Handed in today list!');
  }

  await takeScreenshot(page, 'supabase-home-realtime.png');

  // --------------------------------------------------------------------------
  // TEST 3: MyReports Optimistic Withdraw
  // --------------------------------------------------------------------------
  console.log('\n--- Test 3: /my-reports Optimistic Withdraw ---');
  await page.goto(`${BASE_URL}/my-reports`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => {
    return document.body.innerText.includes('LF-2041');
  });

  console.log('Opening withdraw dialog on LF-2041...');
  await page.click('[data-testid="withdraw-btn-2041"]');
  await page.waitForSelector('[data-testid="confirm-withdraw-btn"]');

  console.log('Confirming withdrawal...');
  await page.click('[data-testid="confirm-withdraw-btn"]');
  await new Promise((r) => setTimeout(r, 500));

  const toastVisible = await page.evaluate(() => {
    return document.body.innerText.includes('Report withdrawn') && document.body.innerText.includes('Undo');
  });
  console.log(`Undo Toast visible: ${toastVisible}`);
  if (!toastVisible) {
    throw new Error('FAIL: Withdraw Toast with Undo did not appear!');
  }

  await takeScreenshot(page, 'supabase-myreports-withdraw.png');

  // --------------------------------------------------------------------------
  // TEST 4: Admin Optimistic Claim Approval
  // --------------------------------------------------------------------------
  console.log('\n--- Test 4: /admin Optimistic Claim Approval ---');
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => {
    return document.body.innerText.includes('Julian Vance');
  });

  // Expand first row if not already expanded
  console.log('Approving claim for Julian Vance...');
  await page.click('[data-testid="approve-btn-2041"]');
  await page.waitForSelector('[data-testid="confirm-approve-modal-btn"]');
  await page.click('[data-testid="confirm-approve-modal-btn"]');
  await new Promise((r) => setTimeout(r, 500));

  const adminToastVisible = await page.evaluate(() => {
    return document.body.innerText.includes('Claim approved');
  });
  console.log(`Admin approve Toast visible: ${adminToastVisible}`);
  if (!adminToastVisible) {
    throw new Error('FAIL: Admin approve Toast did not appear!');
  }

  await takeScreenshot(page, 'supabase-admin-approve.png');

  // --------------------------------------------------------------------------
  // TEST 5: Hard Bans Audit
  // --------------------------------------------------------------------------
  console.log('\n--- Test 5: Hard Bans Audit ---');
  const banViolations = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    let gradCount = 0;
    let blurCount = 0;
    for (const el of all) {
      const style = window.getComputedStyle(el);
      if (style.backgroundImage.includes('gradient')) gradCount++;
      if (style.backdropFilter && style.backdropFilter !== 'none') blurCount++;
      if (style.filter.includes('blur')) blurCount++;
    }
    return { gradCount, blurCount };
  });

  console.log(`Gradients found: ${banViolations.gradCount}`);
  console.log(`Blurs found: ${banViolations.blurCount}`);
  if (banViolations.gradCount > 0 || banViolations.blurCount > 0) {
    throw new Error('FAIL: Hard bans violated!');
  }

  await browser.close();
  console.log('\n=== ALL SUPABASE & REALTIME QA CHECKS PASSED ===\n');
}

runSupabaseQA().catch((err) => {
  console.error('QA Test Failure:', err);
  process.exit(1);
});
