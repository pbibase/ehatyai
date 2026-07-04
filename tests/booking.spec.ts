import { test, expect } from '@playwright/test';
import { prisma } from '../src/lib/prisma';

test.describe('S5, S6, S7 - Booking Review, Promos, Payment, and Confirmation', () => {
  test.beforeAll(async () => {
    await prisma.booking.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.notification.deleteMany({});
  });

  // Helper to log in a user during tests
  async function performLoginAndGoToReview(page: any) {
    const randomEmail = `user-${Math.random().toString(36).substring(7)}@ehatyai.com`;
    const randomPhone = `08${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Visit home page, search
    await page.goto('/results?destination=หาดใหญ่&checkIn=2026-07-10&checkOut=2026-07-12&guests=2');
    await page.locator('.property-card').first().click();
    await expect(page).toHaveURL(/\/properties\/.+/);
    await page.locator('text=จองเลย').first().click();

    // Sign up
    await expect(page).toHaveURL(/\/booking/);
    await page.locator('button:has-text("สมัครสมาชิก")').click();
    await page.locator('#register-name').fill('Booking Tester');
    await page.locator('#register-email').fill(randomEmail);
    await page.locator('#register-phone').fill(randomPhone);
    await page.locator('#register-password').fill('password123');
    await page.locator('#register-btn').click();

    // Verify OTP
    await expect(page.locator('text=ยืนยันตัวตนด้วยรหัส OTP')).toBeVisible();
    await page.locator('#otp-code').fill('123456');
    await page.locator('#otp-verify-btn').click();

    // We should land on booker details form, pre-filled
    await expect(page.locator('#booker-name')).toHaveValue('Booking Tester');
    
    // Submit booker details
    await page.locator('text=ดำเนินการต่อ').click();
    
    // Land on review page
    await expect(page.locator('text=ตรวจสอบรายละเอียดและราคารวม')).toBeVisible();
    return { email: randomEmail, phone: randomPhone };
  }

  test('GIVEN promo codes applied, WHEN verifying discounts, THEN net amounts update and zero-price bypasses payment', async ({ page }) => {
    await performLoginAndGoToReview(page);

    // Apply invalid promo
    await page.locator('#promo-input').fill('INVALIDPROMO');
    await page.locator('button:has-text("ใช้โค้ด")').click();
    await expect(page.locator('text=โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ')).toBeVisible();

    // Apply HATYAI100 (฿100 off)
    await page.locator('#promo-input').fill('HATYAI100');
    await page.locator('button:has-text("ใช้โค้ด")').click();
    await expect(page.locator('text=ใช้โค้ด HATYAI100 สำเร็จ')).toBeVisible();
    // Discount row should be present
    await expect(page.locator('text=-฿100.00')).toBeVisible();

    // Apply FREESTAY100 (100% off)
    await page.locator('#promo-input').fill('FREESTAY100');
    await page.locator('button:has-text("ใช้โค้ด")').click();
    await expect(page.locator('text=ใช้โค้ด FREESTAY100 สำเร็จ')).toBeVisible();
    await expect(page.locator('text=฿0.00').last()).toBeVisible(); // Net amount is ฿0.00

    // Click Confirm (bypasses payment)
    await page.locator('text=ยืนยันการจอง').click();

    // Lands on success page directly (Step 9)
    await expect(page.locator('text=การจองห้องพักเสร็จสิ้นและยืนยันแล้ว!')).toBeVisible();
    await expect(page.locator('#booking-id-display')).toBeVisible();
    const bookingId = await page.locator('#booking-id-display').innerText();
    expect(bookingId).toMatch(/^BK-\d+$/);
  });

  test('GIVEN credit card payment failed 3 times, THEN hold is released and booking status is Pending-Payment', async ({ page }) => {
    const { email } = await performLoginAndGoToReview(page);

    // Proceed to payment (without promo code)
    const nextBtnText = await page.locator('button:has-text("ชำระเงิน")').innerText();
    await page.locator('button:has-text("ชำระเงิน")').click();

    // Arrive at Payment step (Step 8)
    await expect(page.locator('text=กรุณาเลือกช่องทางการชำระเงิน')).toBeVisible();

    // Select Credit Card (default) and fill in failed card info
    await page.locator('#card-name').fill('John Doe');
    await page.locator('#card-number').fill('4444111122223333'); // Starts with 4444 (forces failure)
    await page.locator('#card-expiry').fill('12/28');
    await page.locator('#card-cvc').fill('123');

    // Attempt 1
    await page.locator('button:has-text("ชำระเงิน")').click();
    await expect(page.locator('text=การชำระเงินล้มเหลว (ลองได้อีก 2 ครั้ง)')).toBeVisible();

    // Attempt 2
    await page.locator('button:has-text("ชำระเงิน")').click();
    await expect(page.locator('text=การชำระเงินล้มเหลว (ลองได้อีก 1 ครั้ง)')).toBeVisible();

    // Attempt 3 (Final failure, hold release)
    await page.locator('button:has-text("ชำระเงิน")').click();
    await expect(page.locator('text=การทำรายการล้มเหลวครบ 3 ครั้งแล้ว การจองจะถูกจัดเก็บในสถานะ "รอชำระเงิน" และห้องพักที่จองไว้จะหมดเวลาล็อกอินเวนทอรี')).toBeVisible();

    // Verify in database that the user has a booking with Pending-Payment status
    const dbUser = await prisma.user.findUnique({ where: { email } });
    expect(dbUser).not.toBeNull();
    const dbBooking = await prisma.booking.findFirst({
      where: { userId: dbUser!.id },
      orderBy: { createdAt: 'desc' }
    });
    expect(dbBooking).not.toBeNull();
    expect(dbBooking!.status).toBe('Pending-Payment');
    expect(dbBooking!.holdExpiresAt).not.toBeNull();
  });

  test('GIVEN payment success, THEN booking is Confirmed and notification entries are logged', async ({ page }) => {
    const { email } = await performLoginAndGoToReview(page);

    // Proceed to payment
    await page.locator('button:has-text("ชำระเงิน")').click();

    // Arrive at Payment step (Step 8)
    await expect(page.locator('text=กรุณาเลือกช่องทางการชำระเงิน')).toBeVisible();

    // Select Credit Card and fill in valid card info
    await page.locator('#card-name').fill('John Doe');
    await page.locator('#card-number').fill('4532111122223333'); // Does not start with 4444 (success card)
    await page.locator('#card-expiry').fill('12/28');
    await page.locator('#card-cvc').fill('123');

    // Pay
    await page.locator('button:has-text("ชำระเงิน")').click();

    // Verify success confirmation
    await expect(page.locator('text=การจองห้องพักเสร็จสิ้นและยืนยันแล้ว!')).toBeVisible();
    await expect(page.locator('#booking-id-display')).toBeVisible();
    const bookingId = await page.locator('#booking-id-display').innerText();

    // Check DB status and notification log
    const dbUser = await prisma.user.findUnique({ where: { email } });
    expect(dbUser).not.toBeNull();
    const dbBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });
    expect(dbBooking).not.toBeNull();
    expect(dbBooking!.status).toBe('Confirmed');

    // Verify Notification logs in DB (BR-7)
    const notifications = await prisma.notification.findMany({
      where: { bookingId }
    });
    expect(notifications.length).toBe(2);
    expect(notifications.some(n => n.channel === 'email' && n.deliveryStatus === 'Sent')).toBe(true);
    expect(notifications.some(n => n.channel === 'sms' && n.deliveryStatus === 'Sent')).toBe(true);
  });
});
