import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import 'dotenv/config';

const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: rawUrl });
const prisma = new PrismaClient({ adapter });

async function check() {
  const users = await prisma.user.count();
  const properties = await prisma.property.count();
  const roomTypes = await prisma.roomType.count();
  const inventories = await prisma.roomInventory.count();
  const bookings = await prisma.booking.count();
  const payments = await prisma.payment.count();
  const notifications = await prisma.notification.count();
  const otps = await prisma.otpCode.count();
  const promos = await prisma.promoCode.count();

  console.log('Row counts per table:');
  console.log(`- User: ${users}`);
  console.log(`- Property: ${properties}`);
  console.log(`- RoomType: ${roomTypes}`);
  console.log(`- RoomInventory: ${inventories}`);
  console.log(`- Booking: ${bookings}`);
  console.log(`- Payment: ${payments}`);
  console.log(`- Notification: ${notifications}`);
  console.log(`- OtpCode: ${otps}`);
  console.log(`- PromoCode: ${promos}`);
}

check()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
