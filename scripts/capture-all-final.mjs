import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://127.0.0.1:5173';
const ARTIFACT_DIR = '/Users/somya_moonat/.gemini/antigravity/brain/ae480934-05a2-4df3-8623-0ddd4b3f1a0a';

const routes = [
  { name: 'home', path: '/' },
  { name: 'browse', path: '/browse' },
  { name: 'item-detail', path: '/items/2041' },
  { name: 'report', path: '/report' },
  { name: 'my-reports', path: '/my-reports' },
  { name: 'admin', path: '/admin' },
  { name: 'sign-in', path: '/sign-in' },
  { name: 'not-found', path: '/unlocated-404-check' },
  { name: 'styleguide', path: '/styleguide' },
];

async function takeScreenshot(page, filename) {
  await page.screenshot({ path: filename, fullPage: true });
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(filename, `${ARTIFACT_DIR}/${filename}`);
  }
  console.log(`Captured: ${filename}`);
}

async function runCapture() {
  console.log('=== Capturing Final Quality Pass Screenshots (1440 & 390) ===\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // 1. Desktop 1440px
  console.log('--- Desktop Viewport (1440 x 900) ---');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  for (const route of routes) {
    console.log(`Loading ${route.name} at 1440px (${route.path})...`);
    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600)); // Allow soft spring transitions to settle
    await takeScreenshot(page, `final-1440-${route.name}.png`);
  }

  // 2. Mobile 390px
  console.log('\n--- Mobile Viewport (390 x 844) ---');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

  for (const route of routes) {
    console.log(`Loading ${route.name} at 390px (${route.path})...`);
    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));
    await takeScreenshot(page, `final-390-${route.name}.png`);
  }

  // 3. Tablet 768px Motion Check
  console.log('\n--- Tablet Viewport (768 x 1024) Motion Check ---');
  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });
  for (const route of ['home', 'browse', 'admin']) {
    const r = routes.find((x) => x.name === route);
    await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));
    await takeScreenshot(page, `final-768-${route}.png`);
  }

  await browser.close();
  console.log('\n=== ALL FINAL QUALITY SCREENSHOTS CAPTURED SUCCESSFULLY ===\n');
}

runCapture().catch((err) => {
  console.error('Capture Failure:', err);
  process.exit(1);
});
