import { test, expect } from '@playwright/test';
import { prisma } from '../src/lib/prisma';
import crypto from 'crypto';

test.describe('S8 - My Bookings and Polish', () => {
  test('GIVEN bookings exist, WHEN visiting My Bookings page, THEN list displays correctly and filters dynamically', async ({ page }) => {
    // 1. Create a test user and seed bookings in DB for them
    const randomEmail = `user-${Math.random().toString(36).substring(7)}@ehatyai.com`;
    const randomPhone = `08${Math.floor(10000000 + Math.random() * 90000000)}`;
    
    // Get a room type
    const roomType = await prisma.roomType.findFirst({
      include: { property: true }
    });
    expect(roomType).not.toBeNull();

    const user = await prisma.user.create({
      data: {
        name: 'My Bookings Tester',
        email: randomEmail,
        phone: randomPhone,
        passwordHash: crypto.createHash('sha256').update('password123').digest('hex'),
        verified: true
      }
    });

    // Cleanup previous runs if database was not reset
    await prisma.booking.deleteMany({
      where: {
        id: { in: ['BK-TESTCONF', 'BK-TESTPEND'] }
      }
    });

    // Seed 1 Confirmed booking
    await prisma.booking.create({
      data: {
        id: `BK-TESTCONF`,
        userId: user.id,
        roomTypeId: roomType!.id,
        checkIn: new Date('2026-08-01T00:00:00.000Z'),
        checkOut: new Date('2026-08-03T00:00:00.000Z'),
        guests: 2,
        status: 'Confirmed',
        priceBreakdown: JSON.stringify({ netAmount: 1800.00 }),
      }
    });

    // Seed 1 Pending-Payment booking
    await prisma.booking.create({
      data: {
        id: `BK-TESTPEND`,
        userId: user.id,
        roomTypeId: roomType!.id,
        checkIn: new Date('2026-08-05T00:00:00.000Z'),
        checkOut: new Date('2026-08-07T00:00:00.000Z'),
        guests: 2,
        status: 'Pending-Payment',
        priceBreakdown: JSON.stringify({ netAmount: 1800.00 }),
      }
    });

    // 2. Perform Login on front-end
    // Go to booking page and login
    await page.goto('/booking');
    await page.locator('#login-email').fill(randomEmail);
    await page.locator('#login-password').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Verify logged in (My bookings link is in header)
    await expect(page.locator('text=การจองของฉัน')).toBeVisible();

    // 3. Visit My Bookings page
    await page.goto('/my-bookings');
    await expect(page.locator('text=ประวัติการจองห้องพัก')).toBeVisible();

    // Verify both bookings are listed
    await expect(page.locator('text=BK-TESTCONF')).toBeVisible();
    await expect(page.locator('text=BK-TESTPEND')).toBeVisible();

    // Check status badges
    await expect(page.locator('text=ยืนยันแล้ว')).toBeVisible();
    await expect(page.locator('text=รอชำระเงิน')).toBeVisible();

    // 4. Test Search/Filter input
    await page.locator('#search-bookings').fill('CONF');
    await expect(page.locator('text=BK-TESTCONF')).toBeVisible();
    await expect(page.locator('text=BK-TESTPEND')).not.toBeVisible();

    // Reset search
    await page.locator('#search-bookings').fill('');
    await expect(page.locator('text=BK-TESTPEND')).toBeVisible();
  });
});
