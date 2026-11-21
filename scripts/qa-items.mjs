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
}

async function runItemDetailQA() {
  console.log('--- Starting /items/:id & Claim Flow QA ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // 1. Desktop 1440x900
  console.log('1. Setting viewport to 1440x900...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // Navigate from /browse to test entry transition & scroll restoration
  console.log('Navigating to /browse first...');
  await page.goto(`${BASE_URL}/browse`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('a[href^="/items/"]');

  console.log('Clicking first item card to navigate to /items/2041...');
  const firstCard = await page.waitForSelector('a[href="/items/2041"]');
  await firstCard.click();

  // Wait for item detail page to mount and load
  await page.waitForSelector('h1');
  await new Promise((r) => setTimeout(r, 800)); // Allow stagger to settle

  const title = await page.evaluate(() => document.querySelector('h1')?.textContent?.trim());
  console.log('Mounted /items/2041 with title:', title);

  console.log('Capturing default item detail page at 1440px...');
  await takeScreenshot(page, 'item-1440-default.png', { fullPage: true });

  // 2. Test Thumbnail switching
  console.log('Testing thumbnail switching...');
  const thumbnailButtons = await page.$$('button:has(span.text-\\[10px\\])');
  if (thumbnailButtons.length > 1) {
    console.log(`Found ${thumbnailButtons.length} thumbnail views. Clicking 2nd thumbnail...`);
    await thumbnailButtons[1].click();
    await new Promise((r) => setTimeout(r, 400));
    console.log('Clicking 3rd thumbnail...');
    await thumbnailButtons[2].click();
    await new Promise((r) => setTimeout(r, 400));
    await takeScreenshot(page, 'item-1440-thumbnail-switched.png');
  }

  // 3. Test Reference Code Copy Button
  console.log('Testing reference code copy button...');
  const copyBtn = await page.waitForSelector('[data-testid="copy-ref-button"]');
  await copyBtn.click();
  await new Promise((r) => setTimeout(r, 200));

  const copiedLabelVisible = await page.evaluate(() => {
    return document.body.innerText.includes('Copied');
  });
  console.log('Is "Copied" label visible immediately after click?', copiedLabelVisible);

  // Wait 1.6s for copied label to revert
  await new Promise((r) => setTimeout(r, 1600));
  const copiedLabelAfter = await page.evaluate(() => {
    return document.body.innerText.includes('Copied');
  });
  console.log('Is "Copied" label gone after 1.6s?', !copiedLabelAfter);

  // 4. Test Similar Items Scroll Reveal
  console.log('Testing similar items row on scroll...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 600));
  const similarCardsCount = await page.evaluate(() => {
    const section = document.querySelector('section');
    return section ? section.querySelectorAll('a[href^="/items/"]').length : 0;
  });
  console.log('Similar items rendered count:', similarCardsCount);

  // Scroll back up
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 300));

  // 5. Test Claim Flow
  console.log('Opening Claim Sheet on Desktop...');
  const claimBtn = await page.waitForSelector('[data-testid="claim-item-button"]');
  await claimBtn.click();
  await new Promise((r) => setTimeout(r, 600)); // Allow sheet spring entrance

  console.log('Capturing Claim Sheet open on Desktop...');
  await takeScreenshot(page, 'item-1440-claim-sheet-form.png');

  // Fill in claim form
  console.log('Filling in claim form...');
  const descTextarea = await page.waitForSelector('textarea');
  await descTextarea.type('Scientific calculator with dark grey slide cover and a slight scratch on solar cell.');

  const identifyingInput = await page.waitForSelector('input[placeholder*="Contents, lock screen"]');
  await identifyingInput.type('Math Dept 2024 sticker residue on bottom case');

  const nameInput = await page.waitForSelector('input[placeholder*="Alex Morgan"]');
  await nameInput.type('Jordan Lee');

  const emailInput = await page.waitForSelector('input[placeholder*="username@stjude.edu"]');
  await emailInput.type('jordan.lee@stjude.edu');

  // Measure button width before submit to verify "no width change"
  const submitBtnWidthBefore = await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="submit-claim-btn"]');
    return btn ? btn.getBoundingClientRect().width : 0;
  });

  console.log('Submitting claim form...');
  const submitBtn = await page.waitForSelector('[data-testid="submit-claim-btn"]');
  await submitBtn.click();

  // Check width during spinner state
  await new Promise((r) => setTimeout(r, 150));
  const submitBtnWidthDuring = await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="submit-claim-btn"]');
    return btn ? btn.getBoundingClientRect().width : 0;
  });
  console.log(`Submit button width before: ${submitBtnWidthBefore}px, during spinner: ${submitBtnWidthDuring}px`);

  // Wait for submission completion and crossfade to success state
  console.log('Waiting for claim success state and ClaimTicket entrance...');
  await page.waitForFunction(() => {
    return document.body.innerText.includes('Claim sent. The desk will review it within 2 working days.');
  }, { timeout: 8000 });

  // Allow ClaimTicket soft spring (0.7s) and mono code highlight (0.3s) to settle
  await new Promise((r) => setTimeout(r, 1100));

  // Verify ClaimTicket elements
  const ticketVerified = await page.evaluate(() => {
    const slot = document.querySelector('[data-testid="ticket-slot-line"]');
    const ticketCard = document.querySelector('[data-testid="claim-ticket-card"]');
    const refCode = document.querySelector('[data-testid="ticket-ref-code"]');
    const topNotch = document.querySelector('[data-testid="notch-top"]');
    const bottomNotch = document.querySelector('[data-testid="notch-bottom"]');
    return {
      hasSlot: !!slot,
      hasCard: !!ticketCard,
      refCodeText: refCode?.textContent?.trim(),
      hasTopNotch: !!topNotch,
      hasBottomNotch: !!bottomNotch,
    };
  });
  console.log('ClaimTicket component verification:', ticketVerified);

  console.log('Capturing Claim Sheet Success with ClaimTicket at 1440px...');
  await takeScreenshot(page, 'item-1440-claim-success-ticket.png');

  // Dismiss sheet
  console.log('Dismissing claim sheet...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const returnBtn = buttons.find((b) => b.textContent.includes('Return to item details'));
    if (returnBtn) returnBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Verify that on the item page, the button is replaced by "This item has been claimed."
  const claimedMessage = await page.evaluate(() => {
    const msg = document.querySelector('[data-testid="claimed-message"]');
    return msg ? msg.textContent.trim() : null;
  });
  console.log('Item page claimed status message:', claimedMessage);
  await takeScreenshot(page, 'item-1440-claimed-state.png', { fullPage: true });

  // 6. Mobile 390x844
  console.log('6. Setting viewport to 390x844 (mobile)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(`${BASE_URL}/items/2042`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('h1');
  await new Promise((r) => setTimeout(r, 600));

  console.log('Capturing mobile /items/2042 default...');
  await takeScreenshot(page, 'item-390-default.png', { fullPage: true });

  // Open mobile bottom claim sheet
  console.log('Opening mobile bottom claim sheet...');
  const mobileClaimBtn = await page.waitForSelector('[data-testid="claim-item-button"]');
  await mobileClaimBtn.click();
  await new Promise((r) => setTimeout(r, 600));

  console.log('Capturing mobile bottom claim sheet...');
  await takeScreenshot(page, 'item-390-sheet-form.png');

  // Submit on mobile
  const mobileDesc = await page.waitForSelector('textarea');
  await mobileDesc.type('Room keys on red university lanyard with room number 302 tag.');
  const mobileDetail = await page.waitForSelector('input[placeholder*="Contents, lock screen"]');
  await mobileDetail.type('Small bronze padlock key and laundry token');
  const mobileName = await page.waitForSelector('input[placeholder*="Alex Morgan"]');
  await mobileName.type('Samira Patel');
  const mobileEmail = await page.waitForSelector('input[placeholder*="username@stjude.edu"]');
  await mobileEmail.type('spatel@stjude.edu');

  const mobileSubmit = await page.waitForSelector('[data-testid="submit-claim-btn"]');
  await mobileSubmit.click();

  await page.waitForFunction(() => {
    return document.body.innerText.includes('Claim sent. The desk will review it within 2 working days.');
  }, { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 1100));

  console.log('Capturing mobile claim success with ClaimTicket...');
  await takeScreenshot(page, 'item-390-claim-success-ticket.png');

  // 7. Hard Bans Audit
  console.log('7. Running hard bans audit on /items/:id...');
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
  console.log('--- /items/:id & Claim Flow QA Complete ---');
}

runItemDetailQA().catch((err) => {
  console.error('ItemDetail QA failed:', err);
  process.exit(1);
});
