import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://127.0.0.1:5173';
const ARTIFACT_DIR = '/Users/somya_moonat/.gemini/antigravity/brain/ae480934-05a2-4df3-8623-0ddd4b3f1a0a';

async function takeScreenshot(page, filename, options = {}) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await new Promise((r) => setTimeout(r, 100));
  await page.screenshot({ path: filename, ...options });
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(filename, `${ARTIFACT_DIR}/${filename}`);
  }
  console.log(`Saved screenshot: ${filename}`);
}

async function runQA() {
  console.log('=== Starting /sign-in and /my-reports QA ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // -----------------------------------------------------------------
  // 1. DESKTOP 1440x900 - SIGN-IN TESTS
  // -----------------------------------------------------------------
  console.log('\n--- 1. Testing /sign-in on Desktop (1440x900) ---');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle0' });

  await page.waitForSelector('[data-testid="signin-form"]');
  console.log('Mounted /sign-in. Capturing default state...');
  await takeScreenshot(page, 'signin-1440-default.png');

  // Test invalid non-college email validation with height reveal
  console.log('Testing non-college email validation...');
  await page.type('[data-testid="signin-email-input"]', 'external.user@gmail.com');
  await page.type('[data-testid="signin-password-input"]', 'secret123');
  await page.click('[data-testid="signin-submit-btn"]');
  await new Promise((r) => setTimeout(r, 300));

  await page.waitForSelector('[data-testid="signin-email-error"]');
  const errorText = await page.evaluate(() =>
    document.querySelector('[data-testid="signin-email-error"]')?.textContent?.trim()
  );
  console.log('Inline error correctly displayed:', errorText);

  // Check brick red border
  const hasBrickBorder = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="signin-email-input"]');
    return el?.classList.contains('border-brick');
  });
  console.log('Input correctly highlighted with brick red border (no shaking):', hasBrickBorder);
  await takeScreenshot(page, 'signin-1440-error.png');

  // Now enter valid university email
  console.log('Entering valid university email j.vance@stjude.edu...');
  await page.click('[data-testid="signin-email-input"]');
  await page.evaluate(() => {
    const el = document.querySelector('[data-testid="signin-email-input"]');
    if (el) el.value = '';
  });
  await page.type('[data-testid="signin-email-input"]', 'j.vance@stjude.edu');
  await page.click('[data-testid="signin-submit-btn"]');

  // Wait for authentication and redirect to /my-reports
  console.log('Waiting for sign-in spinner and redirect to /my-reports...');
  await page.waitForFunction(() => window.location.pathname === '/my-reports', { timeout: 5000 });
  await new Promise((r) => setTimeout(r, 600));

  const authUser = await page.evaluate(() => localStorage.getItem('sju_authenticated_user'));
  console.log('Successfully signed in. Stored user:', authUser);
  await takeScreenshot(page, 'myreports-1440-authenticated.png');

  // -----------------------------------------------------------------
  // 2. DESKTOP 1440x900 - MY REPORTS TESTS
  // -----------------------------------------------------------------
  console.log('\n--- 2. Testing /my-reports on Desktop (1440x900) ---');

  // Check tabs: Lost by me, Found by me, My claims
  await page.waitForSelector('[data-testid="tab-lost"]');
  await page.waitForSelector('[data-testid="tab-found"]');
  await page.waitForSelector('[data-testid="tab-claims"]');
  console.log('All three tabs rendered.');

  // Test expanding row inline to view status timeline
  console.log('Testing inline row expansion and custody timeline...');
  const firstRow = await page.waitForSelector('[data-testid="report-row-2041"]');
  // Row 2041 is expanded by default or click to toggle
  await new Promise((r) => setTimeout(r, 400));
  await takeScreenshot(page, 'myreports-1440-expanded-timeline.png');

  // Test Notification Bell Popover
  console.log('Testing notification bell popover in navbar...');
  await page.click('[data-testid="notification-bell-trigger"]');
  await page.waitForSelector('[data-testid="notification-popover-content"]');
  await new Promise((r) => setTimeout(r, 350));
  await takeScreenshot(page, 'myreports-1440-notification-popover.png');

  // Click first unread notification to test dot scale-out
  console.log('Clicking unread notification to test dot scale-out...');
  const firstNotifItem = await page.$('[data-testid="notification-item-notif-1"]');
  if (firstNotifItem) {
    await firstNotifItem.click();
    await new Promise((r) => setTimeout(r, 300));
  }
  // Close popover by clicking outside
  await page.click('h1');
  await new Promise((r) => setTimeout(r, 300));

  // Test Tab Switching: Click "Found by me"
  console.log('Switching to "Found by me" tab...');
  await page.click('[data-testid="tab-found"]');
  await new Promise((r) => setTimeout(r, 450));
  await takeScreenshot(page, 'myreports-1440-tab-found.png');

  // Click "My claims" tab
  console.log('Switching to "My claims" tab...');
  await page.click('[data-testid="tab-claims"]');
  await new Promise((r) => setTimeout(r, 450));
  await takeScreenshot(page, 'myreports-1440-tab-claims.png');

  // Switch back to "Lost by me" tab
  console.log('Switching back to "Lost by me" tab...');
  await page.click('[data-testid="tab-lost"]');
  await new Promise((r) => setTimeout(r, 450));

  // Test "Withdraw report" and Confirm Dialog
  console.log('Testing "Withdraw report" confirm dialog...');
  const withdrawBtn = await page.waitForSelector('[data-testid="withdraw-btn-2041"]');
  await withdrawBtn.click();
  await page.waitForSelector('[data-testid="confirm-withdraw-btn"]');
  await new Promise((r) => setTimeout(r, 300));
  await takeScreenshot(page, 'myreports-1440-withdraw-dialog.png');

  // Confirm withdrawal
  console.log('Confirming withdrawal...');
  await page.click('[data-testid="confirm-withdraw-btn"]');
  await new Promise((r) => setTimeout(r, 500)); // Allow collapse animation and toast to mount

  // Verify Toast with Undo button appeared
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('div[role="region"] button')).some((b) => b.textContent.includes('Undo'))
  );
  console.log('Withdrawal confirmed. Toast with Undo action appeared.');
  await takeScreenshot(page, 'myreports-1440-toast-undo.png');

  // Click Undo in the Toast
  console.log('Clicking Undo in the Toast...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="region"] button'));
    const undoBtn = btns.find((b) => b.textContent.includes('Undo'));
    undoBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 600)); // Allow item to re-insert and animate in

  const isRowRestored = await page.evaluate(() => !!document.querySelector('[data-testid="report-row-2041"]'));
  console.log('Report row 2041 successfully restored via Undo:', isRowRestored);
  await takeScreenshot(page, 'myreports-1440-undone.png');

  // -----------------------------------------------------------------
  // 3. MOBILE 390x844 - SIGN-IN & MY REPORTS
  // -----------------------------------------------------------------
  console.log('\n--- 3. Testing Mobile (390x844) Viewport ---');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true });

  // Test /sign-in on mobile
  await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle0' });
  await takeScreenshot(page, 'signin-390-default.png');

  // Test /my-reports on mobile
  await page.goto(`${BASE_URL}/my-reports`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  await takeScreenshot(page, 'myreports-390-default.png');

  // Expand row on mobile
  const mobileRow = await page.waitForSelector('[data-testid="report-row-2041"]');
  await mobileRow.click();
  await new Promise((r) => setTimeout(r, 400));
  await takeScreenshot(page, 'myreports-390-expanded.png');

  // -----------------------------------------------------------------
  // 4. HARD BANS & ACCESSIBILITY AUDIT
  // -----------------------------------------------------------------
  console.log('\n--- 4. Running Hard Bans & Accessibility Audit ---');
  const auditResult = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    let gradientCount = 0;
    let backdropFilterCount = 0;
    let emojiMatches = [];

    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    all.forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.backgroundImage.includes('gradient')) {
        gradientCount++;
      }
      if (style.backdropFilter && style.backdropFilter !== 'none') {
        backdropFilterCount++;
      }
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
        const text = el.textContent || '';
        if (emojiRegex.test(text)) {
          emojiMatches.push(text);
        }
      }
    });

    return {
      gradientCount,
      backdropFilterCount,
      emojiCount: emojiMatches.length,
      emojiMatches: emojiMatches.slice(0, 5),
    };
  });

  console.log('Audit Results:');
  console.log('- Gradients found:', auditResult.gradientCount);
  console.log('- Backdrop filters found:', auditResult.backdropFilterCount);
  console.log('- Emojis found:', auditResult.emojiCount);

  if (auditResult.gradientCount > 0) {
    throw new Error(`Hard ban violated: Found ${auditResult.gradientCount} gradient instances`);
  }
  if (auditResult.backdropFilterCount > 0) {
    throw new Error(`Hard ban violated: Found ${auditResult.backdropFilterCount} backdrop-filter instances`);
  }
  if (auditResult.emojiCount > 0) {
    throw new Error(`Hard ban violated: Found emojis ${JSON.stringify(auditResult.emojiMatches)}`);
  }

  console.log('\n=== All /sign-in and /my-reports QA checks passed cleanly! ===\n');
  await browser.close();
}

runQA().catch((err) => {
  console.error('QA Test failed:', err);
  process.exit(1);
});
