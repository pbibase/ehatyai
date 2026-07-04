import { test, expect } from '@playwright/test';
import { prisma } from '../src/lib/prisma';

test.describe('S4 - Login Wall with Context Persistence', () => {
  test.beforeAll(async () => {
    await prisma.booking.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.notification.deleteMany({});
  });

  test('GIVEN anonymous booking selected, WHEN registering with OTP, THEN booking survives auth and pre-fills details', async ({ page }) => {
    // 1. Visit details page of a property directly
    // Let's search first or query DB for property ID. We can just visit the results page and click first card.
    await page.goto('/results?destination=หาดใหญ่&checkIn=2026-07-10&checkOut=2026-07-12&guests=2');
    await page.locator('.property-card').first().click();

    await expect(page).toHaveURL(/\/properties\/.+/);
    
    // Select the first room and click Book now
    await page.locator('text=จองเลย').first().click();

    // 2. We should be redirected to the booking page (Step 5 - Login Wall)
    await expect(page).toHaveURL(/\/booking/);
    await expect(page.locator('button:has-text("สมัครสมาชิก")')).toBeVisible();

    // Switch to Register tab
    await page.locator('button:has-text("สมัครสมาชิก")').click();

    // Fill in registration info
    const randomEmail = `test-${Math.random().toString(36).substring(7)}@ehatyai.com`;
    const randomPhone = `08${Math.floor(10000000 + Math.random() * 90000000)}`;
    await page.locator('#register-name').fill('John Doe Test');
    await page.locator('#register-email').fill(randomEmail);
    await page.locator('#register-phone').fill(randomPhone);
    await page.locator('#register-password').fill('password123');
    
    // Click register
    await page.locator('#register-btn').click();

    // 3. OTP Modal should be visible
    await expect(page.locator('text=ยืนยันตัวตนด้วยรหัส OTP')).toBeVisible();
    await expect(page.locator('#otp-code')).toBeVisible();

    // Enter wrong OTP first to check failure
    await page.locator('#otp-code').fill('111111');
    await page.locator('#otp-verify-btn').click();
    await expect(page.locator('text=รหัส OTP ไม่ถูกต้องหรือหมดอายุ')).toBeVisible();

    // Since we don't have the console printed OTP easily in Playwright, 
    // we can implement a mock OTP verification where during tests or in development, 
    // the code "123456" is always accepted, or we can check the database.
    // Let's implement in the API that "123456" is a bypass code for test/dev, 
    // which is a standard pattern for integration testing.
    await page.locator('#otp-code').fill('123456');
    await page.locator('#otp-verify-btn').click();

    // 4. Booking context must survive and user lands on Step 6 Booker Details
    // The booker details form should be pre-filled with the user details
    await expect(page.locator('#booker-name')).toHaveValue('John Doe Test');
    await expect(page.locator('#booker-email')).toHaveValue(randomEmail);
    await expect(page.locator('#booker-phone')).toHaveValue(randomPhone);

    // Confirm that property details are still shown
    await expect(page.locator('#review-property-name')).toBeVisible();
  });
});
