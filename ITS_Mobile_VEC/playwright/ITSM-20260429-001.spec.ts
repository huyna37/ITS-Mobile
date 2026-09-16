import { test, expect } from '@playwright/test';

const SCREENSHOT = (name: string) => `docs/intel/screenshots/ITSM-20260429-001-${name}.png`;

async function clearSession(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('its_session_v1');
    localStorage.removeItem('its_call_history_v1');
  });
  await page.reload();
  await expect(page.getByRole('button', { name: 'ĐĂNG NHẬP' })).toBeVisible();
}

test.describe('ITSM-20260429-001 M1', () => {
  test('M1-F001', async ({ page }) => {
    await clearSession(page);
    await page.screenshot({ path: SCREENSHOT('step-01-login'), fullPage: true });

    await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click();
    await expect(page.getByText('Vui lòng nhập đủ tài khoản và mật khẩu.')).toBeVisible();
    await page.screenshot({ path: SCREENSHOT('step-02-validation-empty'), fullPage: true });

    await page.getByPlaceholder('Nhập username').fill('demo_user');
    await page.getByPlaceholder('Ví dụ: 8011').fill('12');
    await page.locator('input[type="password"]').fill('secret');
    await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click();
    await expect(page.getByText('Extension phải gồm đúng 4 chữ số.')).toBeVisible();
    await page.screenshot({ path: SCREENSHOT('step-03-validation-extension'), fullPage: true });
  });

  test('M1-F002', async ({ page }) => {
    await clearSession(page);
    await page.getByPlaceholder('Nhập username').fill('demo_user');
    await page.getByPlaceholder('Ví dụ: 8011').fill('8011');
    await page.locator('input[type="password"]').fill('password');
    await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click();
    await expect(page.getByRole('heading', { name: 'Liên lạc PBX' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Liên lạc' })).toBeVisible();
    await page.screenshot({ path: SCREENSHOT('step-04-after-login-calls'), fullPage: true });
  });

  test('M1-F003', async ({ page }) => {
    await clearSession(page);
    await page.getByPlaceholder('Nhập username').fill('demo_user');
    await page.getByPlaceholder('Ví dụ: 8011').fill('8011');
    await page.locator('input[type="password"]').fill('password');
    await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click();
    await expect(page.getByRole('heading', { name: 'Liên lạc PBX' })).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: 'Liên lạc' }).click();
    await expect(page.getByRole('heading', { name: 'Liên lạc PBX' })).toBeVisible();
    await page.getByRole('button', { name: 'Danh bạ' }).click();
    await expect(page.getByText('Danh bạ nội bộ')).toBeVisible();

    const firstCall = page.getByRole('button', { name: 'Gọi 9901' });
    await firstCall.click();
    await page.screenshot({ path: SCREENSHOT('step-05-directory-after-call'), fullPage: true });

    await page.getByRole('button', { name: /Lịch sử/ }).click();
    await expect(page.getByText('Trung tâm điều hành (TMC)')).toBeVisible();
    await expect(page.getByText(/Ext 9901/)).toBeVisible();
    await page.screenshot({ path: SCREENSHOT('step-06-call-history'), fullPage: true });
  });

  test('M1-F004', async ({ page }) => {
    await clearSession(page);
    await page.getByPlaceholder('Nhập username').fill('demo_user');
    await page.getByPlaceholder('Ví dụ: 8011').fill('8011');
    await page.locator('input[type="password"]').fill('password');
    await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click();
    await expect(page.getByRole('heading', { name: 'Liên lạc PBX' })).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: 'Tôi' }).click();
    await expect(page.getByRole('heading', { level: 3, name: 'Nguyễn Minh Hoàng' })).toBeVisible();
    await expect(page.getByText('8011').first()).toBeVisible();
    await page.screenshot({ path: SCREENSHOT('step-07-profile'), fullPage: true });

    await page.getByRole('button', { name: 'Đăng xuất hệ thống' }).click();
    await expect(page.getByRole('button', { name: 'ĐĂNG NHẬP' })).toBeVisible();
    await page.screenshot({ path: SCREENSHOT('step-08-after-logout'), fullPage: true });
  });

  test('M1-F005', async ({ page }) => {
    await clearSession(page);
    await page.getByPlaceholder('Nhập username').fill('demo_user');
    await page.getByPlaceholder('Ví dụ: 8011').fill('8011');
    await page.locator('input[type="password"]').fill('password');
    await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click();
    await expect(page.getByRole('heading', { name: 'Liên lạc PBX' })).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: 'SOS khẩn cấp' }).click();
    await expect(page.getByRole('heading', { name: 'Gọi khẩn cấp?' })).toBeVisible();
    await page.screenshot({ path: SCREENSHOT('step-09-sos-modal-open'), fullPage: true });

    await page.getByRole('button', { name: 'Hủy' }).click();
    await expect(page.getByRole('heading', { name: 'Gọi khẩn cấp?' })).not.toBeVisible();
    await page.screenshot({ path: SCREENSHOT('step-10-sos-modal-closed'), fullPage: true });
  });
});
