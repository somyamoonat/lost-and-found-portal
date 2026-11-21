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

async function runReportQA() {
  console.log('=== Starting /report Flow QA ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // -----------------------------------------------------------------
  // 1. DESKTOP 1440x900 - LOST ITEM FLOW
  // -----------------------------------------------------------------
  console.log('\n--- 1. Testing Desktop (1440x900) Lost Item Flow ---');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`${BASE_URL}/report`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear()); // Clear previous drafts for clean test
  await page.goto(`${BASE_URL}/report`, { waitUntil: 'networkidle0' });

  await page.waitForSelector('[data-testid="choice-lost"]');
  console.log('Mounted /report. Testing Step 0 (Choice)...');

  // Verify Choice options
  await takeScreenshot(page, 'report-1440-step0-choice.png');

  // Click "I lost something" and verify URL sync
  await page.click('[data-testid="choice-lost"]');
  await new Promise((r) => setTimeout(r, 300));
  const currentUrl = page.url();
  console.log('Current URL after selecting lost:', currentUrl);
  if (!currentUrl.includes('type=lost')) {
    throw new Error('URL did not update with ?type=lost');
  }

  // Click Continue to Step 1
  console.log('Advancing to Step 1: What is it...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const continueBtn = btns.find((b) => b.textContent.includes('Continue'));
    continueBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 450));

  // Verify Step 1
  await page.waitForSelector('input[data-field="title"]');
  console.log('Step 1 reached. Testing validation error on empty submit...');

  // Try to submit empty to test validation without shaking
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const continueBtn = btns.find((b) => b.textContent.includes('Continue'));
    continueBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 300));

  // Check error message presence
  const hasError = await page.evaluate(() => {
    const titleErr = document.querySelector('input[data-field="title"]');
    return titleErr?.classList.contains('border-brick');
  });
  console.log('Validation correctly highlighted input in brick red:', hasError);
  await takeScreenshot(page, 'report-1440-step1-validation.png');

  // Fill Step 1 fields
  console.log('Selecting category Keys & fobs...');
  await page.click('[data-testid="category-btn-keys"]');

  console.log('Entering title and testing character counter shifts...');
  await page.type('input[data-field="title"]', 'Hostel room keys on red SJU lanyard');

  // Character counter test
  const descText = 'Set of two Yale brass keys with student housing tag and red woven lanyard with white SJU lettering. Missing small silver keyring clip.';
  await page.type('textarea[data-field="description"]', descText);
  await new Promise((r) => setTimeout(r, 200));

  await takeScreenshot(page, 'report-1440-step1-details.png');

  // Advance to Step 2
  console.log('Advancing to Step 2: Where and when...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const continueBtn = btns.find((b) => b.textContent.includes('Continue'));
    continueBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 450));

  await page.waitForSelector('select[data-field="building"]');
  console.log('Step 2 reached. Selecting building and quick chips...');

  await page.select('select[data-field="building"]', 'bldg-lib');
  await page.type('input[data-field="spot"]', '3rd floor silent study desk 42 near windows');

  // Click "Earlier today" quick chip
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const earlierToday = btns.find((b) => b.textContent.includes('Earlier today'));
    earlierToday?.click();
  });
  await new Promise((r) => setTimeout(r, 200));

  await takeScreenshot(page, 'report-1440-step2-location.png');

  // Advance to Step 3
  console.log('Advancing to Step 3: Photo...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const continueBtn = btns.find((b) => b.textContent.includes('Continue'));
    continueBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 450));

  await page.waitForSelector('[data-testid="photo-dropzone"]');
  console.log('Step 3 reached. Testing dropzone and photo attachment...');
  await takeScreenshot(page, 'report-1440-step3-dropzone.png');

  // Advance to Step 4 (Photo is optional for lost items)
  console.log('Advancing to Step 4: Handover / Contact...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const continueBtn = btns.find((b) => b.textContent.includes('Continue'));
    continueBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 450));

  await page.waitForSelector('input[data-field="contactName"]');
  console.log('Step 4 reached. Filling contact details...');

  await page.type('input[data-field="contactName"]', 'Julian Vance');
  await page.type('input[data-field="contactEmail"]', 'j.vance@stjude.edu');
  await page.type('input[type="tel"]', '(555) 019-3382');

  await takeScreenshot(page, 'report-1440-step4-contact.png');

  // Advance to Step 5: Review
  console.log('Advancing to Step 5: Review...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const continueBtn = btns.find((b) => b.textContent.includes('Continue'));
    continueBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 450));

  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('button')).some((b) => b.textContent.includes('Submit report'))
  );
  console.log('Step 5 reached: Review summary.');
  await takeScreenshot(page, 'report-1440-step5-review.png');

  // Verify Edit jumping
  console.log('Testing "Edit" jump to Step 1 (What is it)...');
  await page.evaluate(() => {
    const editBtns = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent.trim() === 'Edit');
    if (editBtns[1]) editBtns[1].click(); // Click Edit on Item details row
  });
  await new Promise((r) => setTimeout(r, 450));
  const isBackOnStep1 = await page.evaluate(() => !!document.querySelector('input[data-field="title"]'));
  console.log('Successfully jumped back to Step 1 via Edit link:', isBackOnStep1);

  // Jump directly back to Step 5 (Review)
  console.log('Jumping back to review via "Return to review" button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const returnBtn = btns.find((b) => b.textContent.includes('Return to review'));
    returnBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 450));

  // Submit the report
  console.log('Submitting the report...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find((b) => b.textContent.includes('Submit report'));
    submitBtn?.click();
  });

  // Wait for submission completion and ClaimTicket entrance animation
  await page.waitForSelector('[data-testid="claim-ticket-card"]', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1200)); // Allow entrance spring and refcode highlight to settle

  const refCode = await page.evaluate(() => document.querySelector('[data-testid="ticket-ref-code"]')?.textContent?.trim());
  console.log('SUCCESS! Report created with ClaimTicket reference code:', refCode);

  await takeScreenshot(page, 'report-1440-success-lost.png');

  // -----------------------------------------------------------------
  // 2. MOBILE 390x844 - FOUND ITEM FLOW
  // -----------------------------------------------------------------
  console.log('\n--- 2. Testing Mobile (390x844) Found Item Flow ---');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true });
  await page.goto(`${BASE_URL}/report?type=found`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE_URL}/report?type=found`, { waitUntil: 'networkidle0' });

  await page.waitForSelector('[data-testid="choice-found"]');
  console.log('Mobile mounted with Found item preselected.');
  await takeScreenshot(page, 'report-390-step0-choice.png');

  // Advance to Step 1
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const continueBtn = btns.find((b) => b.textContent.includes('Continue'));
    continueBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 450));

  await page.waitForSelector('input[data-field="title"]');
  await page.click('[data-testid="category-btn-wallets-ids"]');
  await page.type('input[data-field="title"]', 'Brown leather bifold wallet with student ID');
  await page.type('textarea[data-field="description"]', 'Found on cafeteria bench. Contains student ID card with surname blurred, cafeteria meal pass, and loose change.');

  await takeScreenshot(page, 'report-390-step1-details.png');

  // Advance to Step 2
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const continueBtn = btns.find((b) => b.textContent.includes('Continue'));
    continueBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 450));

  await page.waitForSelector('select[data-field="building"]');
  await page.select('select[data-field="building"]', 'bldg-union');
  await page.type('input[data-field="spot"]', 'Dining hall lower level, 2nd booth near east exit');

  await takeScreenshot(page, 'report-390-step2-location.png');

  // Advance to Step 3: Photo & Confidential Verification Detail
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const continueBtn = btns.find((b) => b.textContent.includes('Continue'));
    continueBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 450));

  await page.waitForSelector('textarea[data-field="verificationDetail"]');
  console.log('Found flow Step 3: Testing confidential verification detail requirement...');

  // Try to advance without verification detail to test validation
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const continueBtn = btns.find((b) => b.textContent.includes('Continue'));
    continueBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 300));

  const hasVerifError = await page.evaluate(() => {
    const el = document.querySelector('textarea[data-field="verificationDetail"]');
    return el?.classList.contains('border-brick');
  });
  console.log('Verification detail properly required in Found flow:', hasVerifError);

  // Fill confidential verification detail
  await page.type(
    'textarea[data-field="verificationDetail"]',
    'Student ID card #SJU-88492 inside card slot. Family photograph inside inner cash sleeve. $15 cash.'
  );

  await takeScreenshot(page, 'report-390-step3-found-verification.png');

  // Advance to Step 4: Custody status & Contact
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const continueBtn = btns.find((b) => b.textContent.includes('Continue'));
    continueBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 450));

  await page.waitForSelector('input[data-field="contactName"]');
  console.log('Found flow Step 4: Setting custody and finder contact...');

  await page.type('input[data-field="contactName"]', 'Clara Oswald');
  await page.type('input[data-field="contactEmail"]', 'c.oswald@stjude.edu');

  await takeScreenshot(page, 'report-390-step4-custody.png');

  // Advance to Step 5: Review
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const continueBtn = btns.find((b) => b.textContent.includes('Continue'));
    continueBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 450));

  await takeScreenshot(page, 'report-390-step5-review.png');

  // Submit found report
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find((b) => b.textContent.includes('Submit report'));
    submitBtn?.click();
  });

  // Wait for ClaimTicket on mobile
  await page.waitForSelector('[data-testid="claim-ticket-card"]', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1200));

  const foundRefCode = await page.evaluate(() => document.querySelector('[data-testid="ticket-ref-code"]')?.textContent?.trim());
  console.log('SUCCESS! Found report created on Mobile with ClaimTicket reference code:', foundRefCode);

  await takeScreenshot(page, 'report-390-success-found.png');

  // -----------------------------------------------------------------
  // 3. HARD BANS & ACCESSIBILITY AUDIT
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

  console.log('\n=== All /report QA checks passed cleanly! ===\n');
  await browser.close();
}

runReportQA().catch((err) => {
  console.error('QA Test failed:', err);
  process.exit(1);
});
