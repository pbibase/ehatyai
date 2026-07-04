import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import crypto from 'crypto';
import 'dotenv/config';

const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: rawUrl });
const prisma = new PrismaClient({ adapter });



function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Start seeding...');

  // Clean database
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.user.deleteMany();
  await prisma.roomInventory.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.property.deleteMany();
  await prisma.promoCode.deleteMany();

  // 1. Create default test users
  const passwordHash = hashPassword('password123');
  const testUser = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'member@ehatyai.com',
      phone: '0812345678',
      passwordHash,
      verified: true,
    },
  });
  console.log(`Created test user: ${testUser.email}`);

  // 2. Create promo codes
  await prisma.promoCode.create({
    data: {
      code: 'HATYAI100',
      discount: 100,
      isPercent: false,
    },
  });
  await prisma.promoCode.create({
    data: {
      code: 'FREESTAY100',
      discount: 100,
      isPercent: true,
    },
  });
  console.log('Created promo codes');

  // 3. Create properties
  const propertiesData = [
    {
      name: 'Lee Gardens Plaza Hotel',
      location: 'Lee Gardens, Hat Yai',
      type: 'Hotel',
      description: 'Centrally located hotel in the heart of Hat Yai, steps away from shopping and street food markets.',
      amenities: 'WiFi, Pool, AC, Fitness Center, Parking',
      photos: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60,https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=60',
      rating: 4.3,
      roomTypes: [
        { name: 'Deluxe Double Room', capacity: 2, basePrice: 1200, inventoryCount: 5 },
        { name: 'Executive Suite', capacity: 4, basePrice: 2500, inventoryCount: 2 },
      ]
    },
    {
      name: 'Samila Beach Resort',
      location: 'Samila Beach, Songkhla',
      type: 'Resort',
      description: 'Beautiful beachfront resort overlooking the Gulf of Thailand and the famous Golden Mermaid statue.',
      amenities: 'WiFi, Pool, AC, Beachfront, Restaurant, Bar',
      photos: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=60,https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=60',
      rating: 4.5,
      roomTypes: [
        { name: 'Sea View Room', capacity: 2, basePrice: 2200, inventoryCount: 4 },
        { name: 'Beachfront Villa', capacity: 4, basePrice: 4800, inventoryCount: 2 },
      ]
    },
    {
      name: 'Hat Yai Central Hotel',
      location: 'Lee Gardens, Hat Yai',
      type: 'Hotel',
      description: 'Affordable comfort in downtown Hat Yai, ideal for business travelers and tourists alike.',
      amenities: 'AC, Restaurant, Laundry Service, Room Service',
      photos: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=60,https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&auto=format&fit=crop&q=60',
      rating: 4.0,
      roomTypes: [
        { name: 'Standard Room', capacity: 2, basePrice: 900, inventoryCount: 6 },
        { name: 'Deluxe Room', capacity: 2, basePrice: 1100, inventoryCount: 4 },
      ]
    },
    {
      name: 'Ton Nga Chang Eco Lodge',
      location: 'Ton Nga Chang, Hat Yai',
      type: 'Resort',
      description: 'Quiet eco-lodge located near the famous Ton Nga Chang waterfall. Perfect for nature lovers.',
      amenities: 'WiFi, AC, Parking, Garden, Mountain View, Kitchenette',
      photos: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&auto=format&fit=crop&q=60,https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop&q=60',
      rating: 4.2,
      roomTypes: [
        { name: 'Forest Cabin', capacity: 2, basePrice: 1500, inventoryCount: 3 },
        { name: 'Family Lodge', capacity: 6, basePrice: 3200, inventoryCount: 2 },
      ]
    },
    {
      name: 'Klong Hae Floating Market Guesthouse',
      location: 'Klong Hae, Hat Yai',
      type: 'Apartment',
      description: 'Charming traditional style guesthouse near the Klong Hae Floating Market. Experience local life.',
      amenities: 'AC, Parking, Balcony, Coffee Maker',
      photos: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=60,https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60',
      rating: 3.8,
      roomTypes: [
        { name: 'Canal View Room', capacity: 2, basePrice: 750, inventoryCount: 4 },
        { name: 'Heritage Suite', capacity: 3, basePrice: 1250, inventoryCount: 2 },
      ]
    },
    {
      name: 'Songkhla Old Town Guesthouse',
      location: 'Songkhla Old Town, Songkhla',
      type: 'Hotel',
      description: 'A beautifully renovated Sino-Portuguese building in the heart of Songkhla historic old town.',
      amenities: 'WiFi, AC, Cafe, Bike Rental, Courtyard',
      photos: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=60,https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop&q=60',
      rating: 4.6,
      roomTypes: [
        { name: 'Retro Room', capacity: 2, basePrice: 1000, inventoryCount: 3 },
        { name: 'Antique Suite', capacity: 2, basePrice: 1600, inventoryCount: 2 },
      ]
    },
    {
      name: 'Hatyai Signature Hotel',
      location: 'Hat Yai City, Hat Yai',
      type: 'Hotel',
      description: 'Modern luxury hotel with sleek design and premium services, located in Hat Yai city center.',
      amenities: 'WiFi, Pool, AC, Fitness Center, Restaurant, Meeting Rooms',
      photos: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop&q=60,https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=60',
      rating: 4.4,
      roomTypes: [
        { name: 'Signature Twin Room', capacity: 2, basePrice: 1400, inventoryCount: 5 },
        { name: 'Presidential Suite', capacity: 4, basePrice: 3800, inventoryCount: 1 },
      ]
    },
    {
      name: 'Centara Hotel Hat Yai',
      location: 'Hat Yai City, Hat Yai',
      type: 'Hotel',
      description: 'A premium hotel integrated with Central Department Store, offering ultimate convenience and upscale comfort.',
      amenities: 'WiFi, Pool, AC, Spa, Fitness Center, 3 Restaurants, Central Access',
      photos: 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800&auto=format&fit=crop&q=60,https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=800&auto=format&fit=crop&q=60',
      rating: 4.5,
      roomTypes: [
        { name: 'Deluxe Room', capacity: 2, basePrice: 1800, inventoryCount: 6 },
        { name: 'Studio Suite', capacity: 3, basePrice: 2900, inventoryCount: 3 },
      ]
    },
    {
      name: 'The Bed Hotel Hatyai',
      location: 'Hat Yai City, Hat Yai',
      type: 'Hotel',
      description: 'Minimalist boutique hotel focusing on sleep quality and convenience, popular with young travelers.',
      amenities: 'WiFi, AC, Coffee Bar, Smart TV, USB Charging Ports',
      photos: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop&q=60,https://images.unsplash.com/photo-1554009975-d74653b879f1?w=800&auto=format&fit=crop&q=60',
      rating: 4.2,
      roomTypes: [
        { name: 'Standard Double', capacity: 2, basePrice: 950, inventoryCount: 8 },
        { name: 'Family Suite', capacity: 4, basePrice: 2100, inventoryCount: 3 },
      ]
    },
    {
      name: 'Samila Mermaid Hotel',
      location: 'Samila Beach, Songkhla',
      type: 'Hotel',
      description: 'Friendly hotel situated right across from Samila Beach. Stunning views and family atmosphere.',
      amenities: 'WiFi, AC, Pool, Restaurant, Kids Play Area',
      photos: 'https://images.unsplash.com/photo-1540549033038-156229554fc0?w=800&auto=format&fit=crop&q=60,https://images.unsplash.com/photo-1606046604972-77cc76aee944?w=800&auto=format&fit=crop&q=60',
      rating: 3.9,
      roomTypes: [
        { name: 'Mermaid Room', capacity: 2, basePrice: 1100, inventoryCount: 5 },
        { name: 'Family Suite', capacity: 4, basePrice: 2300, inventoryCount: 3 },
      ]
    },
    {
      name: 'Greenwood Forest Resort',
      location: 'Ton Nga Chang, Hat Yai',
      type: 'Resort',
      description: 'Nestled in a lush forest canopy, this resort offers peace, quiet, and private wooden bungalows.',
      amenities: 'WiFi, Pool, AC, Balcony, Nature Trail Access',
      photos: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=60,https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=60',
      rating: 4.1,
      roomTypes: [
        { name: 'Bungalow', capacity: 2, basePrice: 1350, inventoryCount: 4 },
        { name: 'Treehouse Cabin', capacity: 2, basePrice: 1850, inventoryCount: 2 },
      ]
    },
    {
      name: 'Khlong Hae Boutique Resort',
      location: 'Klong Hae, Hat Yai',
      type: 'Resort',
      description: 'A stylish boutique resort featuring tropical gardens and modern villas, perfect for a relaxing stay.',
      amenities: 'WiFi, Pool, AC, Garden, Bicycle rental',
      photos: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800&auto=format&fit=crop&q=60,https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&auto=format&fit=crop&q=60',
      rating: 4.3,
      roomTypes: [
        { name: 'Garden Villa', capacity: 2, basePrice: 1600, inventoryCount: 3 },
        { name: 'Poolside Suite', capacity: 4, basePrice: 2800, inventoryCount: 2 },
      ]
    }
  ];

  // 90 days date array at UTC midnight
  const today = new Date();
  const utcToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0));
  const dates: Date[] = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date(utcToday);
    d.setUTCDate(utcToday.getUTCDate() + i);
    dates.push(d);
  }

  for (const prop of propertiesData) {
    const createdProperty = await prisma.property.create({
      data: {
        name: prop.name,
        location: prop.location,
        type: prop.type,
        description: prop.description,
        amenities: prop.amenities,
        photos: prop.photos,
        rating: prop.rating,
      }
    });

    console.log(`Created property: ${createdProperty.name}`);

    for (const rt of prop.roomTypes) {
      const createdRoomType = await prisma.roomType.create({
        data: {
          propertyId: createdProperty.id,
          name: rt.name,
          capacity: rt.capacity,
          basePrice: rt.basePrice,
        }
      });

      console.log(`  Created room type: ${createdRoomType.name}`);

      // Create 90 days inventory for each room type
      const inventoryData = dates.map(date => ({
        roomTypeId: createdRoomType.id,
        date,
        totalCount: rt.inventoryCount,
      }));

      await prisma.roomInventory.createMany({
        data: inventoryData,
      });
      
      console.log(`    Seeded 90 days of inventory for ${rt.name}`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
