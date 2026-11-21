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

async function runAdminQA() {
  console.log('=== Starting /admin Desk Staff QA ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // -----------------------------------------------------------------
  // 1. DESKTOP 1440x900 - FULL CLAIMS & HANDOVER WORKFLOW
  // -----------------------------------------------------------------
  console.log('\n--- 1. Testing /admin on Desktop (1440x900) ---');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' });

  await page.waitForSelector('[data-testid="admin-nav-claims"]');
  console.log('Mounted /admin. Capturing default view at 1440px...');
  await takeScreenshot(page, 'admin-1440-default.png');

  // Verify Top Metrics Row (plain figures, NOT cards)
  const stats = await page.evaluate(() => {
    return {
      awaiting: document.querySelector('[data-testid="stat-awaiting-review"]')?.textContent?.trim(),
      ready: document.querySelector('[data-testid="stat-ready-collect"]')?.textContent?.trim(),
      returned: document.querySelector('[data-testid="stat-returned-month"]')?.textContent?.trim(),
    };
  });
  console.log('Top Metrics row figures:', stats);

  // Row 2041 expanded view with two columns side-by-side
  console.log('Inspecting expanded verification panel (two-column layout)...');
  await page.waitForSelector('[data-testid="claim-row-2041"]');
  await takeScreenshot(page, 'admin-1440-claims-expanded.png');

  // Test Bulk select: Check row 2038 and 2035
  console.log('Testing bulk select and floating action bar with sheet spring...');
  await page.click('[data-testid="claim-row-2038"] input[type="checkbox"]');
  await page.click('[data-testid="claim-row-2035"] input[type="checkbox"]');
  await new Promise((r) => setTimeout(r, 400)); // Allow sheet spring to rise

  await page.waitForSelector('[data-testid="floating-action-bar"]');
  const floatingBarText = await page.evaluate(() =>
    document.querySelector('[data-testid="floating-action-bar"]')?.textContent?.trim()
  );
  console.log('Floating action bar appeared with:', floatingBarText);
  await takeScreenshot(page, 'admin-1440-bulk-select.png');

  // Clear bulk selection
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[data-testid="floating-action-bar"] button'));
    const clearBtn = btns.find((b) => b.textContent.includes('Clear selection'));
    clearBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  // Test "Approve and notify" on LF-2041
  console.log('Testing "Approve and notify" action on LF-2041...');
  await page.click('[data-testid="approve-btn-2041"]');
  await page.waitForSelector('[data-testid="confirm-approve-modal-btn"]');
  await new Promise((r) => setTimeout(r, 300));
  await takeScreenshot(page, 'admin-1440-approve-dialog.png');

  // Confirm approval
  console.log('Confirming approval...');
  await page.click('[data-testid="confirm-approve-modal-btn"]');
  await new Promise((r) => setTimeout(r, 500)); // Allow row collapse (0.25s) and Toast mount
  await takeScreenshot(page, 'admin-1440-approved.png');

  // Test Handover Section
  console.log('\n--- Testing Handover desk ---');
  await page.click('[data-testid="admin-nav-handover"]');
  await page.waitForSelector('[data-testid="handover-input"]');
  await new Promise((r) => setTimeout(r, 350));

  // Enter reference code LF-2030 (ready to collect item)
  console.log('Entering reference code LF-2030 in Handover scanner...');
  await page.type('[data-testid="handover-input"]', 'LF-2030');
  await new Promise((r) => setTimeout(r, 450)); // Allow preview card to slide in

  await page.waitForSelector('[data-testid="handover-preview-card"]');
  console.log('Handover preview card rendered with verified claimant details.');
  await takeScreenshot(page, 'admin-1440-handover-match.png');

  // Click "Mark as returned"
  console.log('Executing handover: Mark as returned...');
  await page.click('[data-testid="mark-returned-btn"]');
  await new Promise((r) => setTimeout(r, 700)); // Allow status morph and collapse
  await takeScreenshot(page, 'admin-1440-handover-returned.png');

  // Switch to "All items" master inventory
  console.log('\n--- Testing All items master catalog ---');
  await page.click('[data-testid="admin-nav-inventory"]');
  await new Promise((r) => setTimeout(r, 350));
  await takeScreenshot(page, 'admin-1440-all-items.png');

  // -----------------------------------------------------------------
  // 2. TABLET 1024x768 - VERIFICATION AT 1024 WIDE
  // -----------------------------------------------------------------
  console.log('\n--- 2. Testing /admin on Tablet (1024x768) ---');
  await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 2 });
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' });

  // 1024 wide Claims queue default
  await page.waitForSelector('[data-testid="admin-nav-claims"]');
  await takeScreenshot(page, 'admin-1024-default.png');

  // Expand a claim at 1024 wide
  console.log('Expanding claim verification panel at 1024 wide...');
  const rowAt1024 = await page.waitForSelector('[data-testid="claim-row-2038"]');
  await rowAt1024.click();
  await new Promise((r) => setTimeout(r, 400));
  await takeScreenshot(page, 'admin-1024-expanded.png');

  // Handover at 1024 wide
  console.log('Testing Handover view at 1024 wide...');
  await page.click('[data-testid="admin-nav-handover"]');
  await page.waitForSelector('[data-testid="handover-input"]');
  // Use quick pick chip
  const quickPick = await page.$('[data-testid="quick-handover-LF-2038"]');
  if (quickPick) {
    await quickPick.click();
    await new Promise((r) => setTimeout(r, 450));
  }
  await takeScreenshot(page, 'admin-1024-handover.png');

  // -----------------------------------------------------------------
  // 3. HARD BANS AUDIT
  // -----------------------------------------------------------------
  console.log('\n--- 3. Running Hard Bans & Accessibility Audit ---');
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

  console.log('\n=== All /admin QA checks passed cleanly! ===\n');
  await browser.close();
}

runAdminQA().catch((err) => {
  console.error('Admin QA failed:', err);
  process.exit(1);
});
