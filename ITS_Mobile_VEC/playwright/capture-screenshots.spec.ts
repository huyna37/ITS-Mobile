import { test, type Page } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const BASE_URL = 'http://localhost:5173';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOT_DIR = path.resolve(__dirname, '../docs/generated/its-mobile-vec-demo/screenshots');

const ANIMATION_CSS = `
  *, *::before, *::after {
    animation-duration: 0ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0ms !important;
    transition-delay: 0ms !important;
  }
`;

const MOCK_SESSION = JSON.stringify({
  token: 'jwt-test',
  profile: {
    ten_nhan_vien: 'Nguyễn Văn A',
    chuc_vu: 'Nhân viên tuần tra',
    extension: '1001',
    don_vi: 'Trạm NB-01',
  },
});

async function prepareForCapture(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.addStyleTag({ content: ANIMATION_CSS }).catch(() => {});
  await page.evaluate(() => (document as any).fonts?.ready).catch(() => {});
  await page.waitForTimeout(400);
}

async function capture(page: Page, filename: string) {
  await prepareForCapture(page);
  const fullPath = path.join(SHOT_DIR, filename);
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await page.screenshot({
        path: fullPath,
        type: 'png',
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
        timeout: 10000,
      });
      console.log(`Captured: ${filename}`);
      return true;
    } catch (e) {
      if (attempt === 2) {
        console.error(`Screenshot failed for ${filename}: ${e}`);
        return false;
      }
      await page.waitForTimeout(500);
    }
  }
  return false;
}

test.describe('ITS Mobile VEC – Screenshot Capture', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    locale: 'vi-VN',
  });

  // ── s01: Login screen (unauthenticated) ─────────────────────────────────────
  test('s01-login', async ({ page }) => {
    // Clear localStorage to ensure unauthenticated state
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    // Wait for login form
    await page.waitForSelector('form', { timeout: 8000 });
    await capture(page, 's01-login.png');
  });

  // ── Authenticated screens ────────────────────────────────────────────────────
  test('s02-calls-directory', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate((session) => {
      localStorage.setItem('its_session_v1', session);
    }, MOCK_SESSION);
    await page.reload({ waitUntil: 'networkidle' });
    // App boots to 'calls' tab with 'directory' sub-tab by default
    await page.waitForSelector('nav', { timeout: 8000 });
    // Ensure calls tab is active (it's default)
    const callsBtn = page.locator('nav button').filter({ hasText: 'Liên lạc' });
    const callsBtnVisible = await callsBtn.count();
    if (callsBtnVisible === 0) {
      // Nav label only shows when active; click by icon position (2nd nav button)
      await page.locator('nav button').nth(1).click();
    } else {
      await callsBtn.click();
    }
    await page.waitForTimeout(300);
    // Ensure directory sub-tab is selected
    await page.locator('button', { hasText: 'Danh bạ' }).click();
    await page.waitForTimeout(300);
    await capture(page, 's02-calls-directory.png');
  });

  test('s03-calls-history', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate((session) => {
      localStorage.setItem('its_session_v1', session);
    }, MOCK_SESSION);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('nav', { timeout: 8000 });
    // Navigate to calls tab
    await page.locator('nav button').nth(1).click();
    await page.waitForTimeout(200);
    // Click history sub-tab
    await page.locator('button', { hasText: 'Lịch sử' }).click();
    await page.waitForTimeout(300);
    await capture(page, 's03-calls-history.png');
  });

  test('s04-tasks-list', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate((session) => {
      localStorage.setItem('its_session_v1', session);
    }, MOCK_SESSION);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('nav', { timeout: 8000 });
    // Click tasks tab (first nav button)
    await page.locator('nav button').nth(0).click();
    await page.waitForTimeout(300);
    await capture(page, 's04-tasks-list.png');
  });

  test('s05-task-detail', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate((session) => {
      localStorage.setItem('its_session_v1', session);
    }, MOCK_SESSION);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('nav', { timeout: 8000 });
    // Navigate to tasks tab
    await page.locator('nav button').nth(0).click();
    await page.waitForTimeout(300);
    // Click first task card
    await page.locator('[role="button"]').first().click();
    await page.waitForTimeout(400);
    // Wait for task detail header
    await page.waitForSelector('text=Chi tiết sự cố', { timeout: 5000 });
    await capture(page, 's05-task-detail.png');
  });

  test('s06-task-status-buttons', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate((session) => {
      localStorage.setItem('its_session_v1', session);
    }, MOCK_SESSION);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('nav', { timeout: 8000 });
    // Navigate to tasks → task detail
    await page.locator('nav button').nth(0).click();
    await page.waitForTimeout(300);
    await page.locator('[role="button"]').first().click();
    await page.waitForTimeout(400);
    await page.waitForSelector('text=Chi tiết sự cố', { timeout: 5000 });
    // Scroll down to reveal status update buttons (use the h3 heading for the status input section)
    await page.locator('h3:has-text("Cập nhật trạng thái (1")').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await capture(page, 's06-task-status-buttons.png');
  });

  test('s07-task-media-attach', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate((session) => {
      localStorage.setItem('its_session_v1', session);
    }, MOCK_SESSION);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('nav', { timeout: 8000 });
    // Navigate to tasks → task detail
    await page.locator('nav button').nth(0).click();
    await page.waitForTimeout(300);
    await page.locator('[role="button"]').first().click();
    await page.waitForTimeout(400);
    await page.waitForSelector('text=Chi tiết sự cố', { timeout: 5000 });
    // Scroll to media attach section
    await page.locator('text=Ảnh & video gửi TMC').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await capture(page, 's07-task-media-attach.png');
  });

  test('s08-notifications', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate((session) => {
      localStorage.setItem('its_session_v1', session);
    }, MOCK_SESSION);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('nav', { timeout: 8000 });
    // Click notifications tab (3rd nav button)
    await page.locator('nav button').nth(2).click();
    await page.waitForTimeout(300);
    await capture(page, 's08-notifications.png');
  });

  test('s09-profile', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate((session) => {
      localStorage.setItem('its_session_v1', session);
    }, MOCK_SESSION);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('nav', { timeout: 8000 });
    // Click profile tab (4th nav button)
    await page.locator('nav button').nth(3).click();
    await page.waitForTimeout(300);
    await capture(page, 's09-profile.png');
  });

  test('s10-sos-dialog', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate((session) => {
      localStorage.setItem('its_session_v1', session);
    }, MOCK_SESSION);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('nav', { timeout: 8000 });
    // Click SOS FAB button
    await page.locator('[aria-label="SOS khẩn cấp"]').click();
    await page.waitForTimeout(300);
    // Wait for dialog
    await page.waitForSelector('text=Gọi khẩn cấp?', { timeout: 5000 });
    await capture(page, 's10-sos-dialog.png');
  });
});
