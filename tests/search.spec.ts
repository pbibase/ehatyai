import { test, expect } from '@playwright/test';
import { prisma } from '../src/lib/prisma';

test.describe('S2 - Search Without Login', () => {
  test.beforeAll(async () => {
    await prisma.booking.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.notification.deleteMany({});
  });

  test('GIVEN anonymous visitor, WHEN browsing steps 1-4, THEN no login prompt appears', async ({ page }) => {
    // Step 1: Open Home Page
    await page.goto('/');
    await expect(page.locator('text=เข้าสู่ระบบ')).not.toBeVisible(); // Login should not be forced
    await expect(page.locator('text=กรุณาเข้าสู่ระบบ')).not.toBeVisible();

    // Step 2: Perform Search
    // Fill in search details
    await page.locator('#destination').fill('หาดใหญ่');
    await page.locator('#checkIn').fill('2026-07-10');
    await page.locator('#checkOut').fill('2026-07-12');
    await page.locator('#guests').selectOption('2');
    await page.locator('#search-btn').click();

    // Step 3: Arrive at Results page
    await expect(page).toHaveURL(/\/results/);
    await expect(page.locator('text=กรุณาเข้าสู่ระบบ')).not.toBeVisible();

    // Step 4: Click on a property
    await page.locator('.property-card').first().click();
    
    // Arrive at Details page
    await expect(page).toHaveURL(/\/properties\/.+/);
    await expect(page.locator('text=กรุณาเข้าสู่ระบบ')).not.toBeVisible();

    // No auth prompts should appear up to here
    await expect(page.locator('text=จองเลย').first()).toBeVisible();
  });

  test('GIVEN filters applied repeatedly, THEN results update each time', async ({ page }) => {
    await page.goto('/results?destination=หาดใหญ่&checkIn=2026-07-10&checkOut=2026-07-12&guests=2');
    
    // Count initial properties
    const initialCount = await page.locator('.property-card').count();
    
    // Apply Hotel filter
    await page.locator('#filter-type-hotel').check();
    await expect(page.locator('.property-card')).not.toHaveCount(initialCount); // count should update

    const countAfterHotel = await page.locator('.property-card').count();

    // Apply WiFi filter
    await page.locator('#filter-amenity-wifi').check();
    await expect(page.locator('.property-card')).not.toHaveCount(countAfterHotel); // count should update again
  });

  test('GIVEN a search with no matches, THEN an empty state suggests adjusting criteria', async ({ page }) => {
    // Search for a place with no matches (e.g. "Unknown Area")
    await page.goto('/results?destination=NonExistentPlace&checkIn=2026-07-10&checkOut=2026-07-12&guests=2');
    
    await expect(page.locator('text=ไม่พบผลลัพธ์')).toBeVisible();
    await expect(page.locator('text=ลองปรับเปลี่ยนเงื่อนไขการค้นหา')).toBeVisible();
  });
});
