import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting StyleBazaar Database Seeding ---');

  // 1. Seed Users (Customer & Admin)
  const passwordHashCustomer = await argon2.hash('Password123!');
  const passwordHashAdmin = await argon2.hash('Admin123!');

  const demoCustomer = await prisma.user.upsert({
    where: { email: 'rahul@example.com' },
    update: {},
    create: {
      id: 'usr-demo-1',
      email: 'rahul@example.com',
      passwordHash: passwordHashCustomer,
      name: 'Rahul Sharma',
      phone: '9876543210',
      gender: 'Male',
      birthday: new Date('1996-08-15'),
      role: 'CUSTOMER',
      isEmailVerified: true,
      walletBalanceInPaise: 100000, // ₹1,000 in paise
      loyaltyPoints: 1250,
      loyaltyTier: 'Gold',
    },
  });
  console.log('Seeded Demo Customer:', demoCustomer.email);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@stylebazaar.com' },
    update: {},
    create: {
      id: 'usr-admin-1',
      email: 'admin@stylebazaar.com',
      passwordHash: passwordHashAdmin,
      name: 'Store Administrator',
      phone: '9876500000',
      gender: 'Other',
      role: 'ADMIN',
      isEmailVerified: true,
      walletBalanceInPaise: 0,
      loyaltyPoints: 0,
      loyaltyTier: 'Platinum',
    },
  });
  console.log('Seeded Admin User:', adminUser.email);

  // Seed default address for Demo Customer
  await prisma.address.upsert({
    where: { id: 'addr-demo-1' },
    update: {},
    create: {
      id: 'addr-demo-1',
      userId: demoCustomer.id,
      name: 'Rahul Sharma',
      phone: '9876543210',
      pincode: '560001',
      city: 'Bengaluru',
      state: 'Karnataka',
      locality: 'MG Road, Ashok Nagar',
      addressLine1: 'Flat 402, Prestige Tower',
      type: 'Home',
      isDefault: true,
    },
  });

  // 2. Seed Brands
  const brandsData = [
    { name: 'Zephyr', slug: 'zephyr', tagline: 'Everyday elevated essentials' },
    { name: 'UrbanThread', slug: 'urbanthread', tagline: 'Contemporary street & casual wear' },
    { name: 'StreetCode', slug: 'streetcode', tagline: 'Bold graphic streetwear' },
    { name: 'Zenith', slug: 'zenith', tagline: 'Tailored smart-casual & formal' },
    { name: 'IronForge', slug: 'ironforge', tagline: 'Rugged denim & utility styles' },
    { name: 'Drift', slug: 'drift', tagline: 'Laid-back resort & leisurewear' },
    { name: 'PeakPulse', slug: 'peakpulse', tagline: 'High-performance activewear' },
    { name: 'Vogue Valley', slug: 'vogue-valley', tagline: 'Runway-inspired women fashion' },
    { name: 'Kalyani', slug: 'kalyani', tagline: 'Classic handloom & festive sarees' },
    { name: 'Saheli', slug: 'saheli', tagline: 'Everyday comfortable ethnic kurtas' },
    { name: 'Ananta', slug: 'ananta', tagline: 'Artisanal heritage Indian luxury' },
    { name: 'DesiCraft', slug: 'desicraft', tagline: 'Handcrafted block-prints & mulmul' },
    { name: 'LilStar', slug: 'lilstar', tagline: 'Playful & durable everyday kids wear' },
    { name: 'TinyTroop', slug: 'tinytroop', tagline: 'Trending mini-me fashion' },
    { name: 'Nimboo', slug: 'nimboo', tagline: 'Soft organic cotton basics for toddlers' },
  ];

  for (const b of brandsData) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }
  console.log(`Seeded ${brandsData.length} Brands`);

  // 3. Seed Pincodes
  const pincodesData = [
    { pincode: '560001', city: 'Bengaluru', state: 'Karnataka', estimatedDays: 2, codAvailable: true },
    { pincode: '400001', city: 'Mumbai', state: 'Maharashtra', estimatedDays: 3, codAvailable: true },
    { pincode: '110001', city: 'New Delhi', state: 'Delhi', estimatedDays: 3, codAvailable: true },
    { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu', estimatedDays: 3, codAvailable: true },
    { pincode: '700001', city: 'Kolkata', state: 'West Bengal', estimatedDays: 4, codAvailable: true },
    { pincode: '500001', city: 'Hyderabad', state: 'Telangana', estimatedDays: 3, codAvailable: true },
    { pincode: '380001', city: 'Ahmedabad', state: 'Gujarat', estimatedDays: 3, codAvailable: true },
    { pincode: '302001', city: 'Jaipur', state: 'Rajasthan', estimatedDays: 4, codAvailable: true },
    { pincode: '226001', city: 'Lucknow', state: 'Uttar Pradesh', estimatedDays: 4, codAvailable: true },
    { pincode: '411001', city: 'Pune', state: 'Maharashtra', estimatedDays: 2, codAvailable: true },
  ];

  for (const pin of pincodesData) {
    await prisma.pincodeServiceability.upsert({
      where: { pincode: pin.pincode },
      update: {},
      create: pin,
    });
  }
  console.log(`Seeded ${pincodesData.length} Pincodes`);

  // 4. Seed Coupons (in Paise)
  const couponsData = [
    { code: 'WELCOME100', type: 'flat', valueInPaise: 10000, minCartValueInPaise: 99900, description: 'Flat ₹100 off on your first order', expiresAt: new Date('2027-12-31') },
    { code: 'FASHION20', type: 'percent', valueInPaise: 20, minCartValueInPaise: 149900, maxDiscountInPaise: 50000, description: '20% off up to ₹500 on all fashion items', expiresAt: new Date('2027-12-31') },
    { code: 'FLAT500', type: 'flat', valueInPaise: 50000, minCartValueInPaise: 249900, description: 'Flat ₹500 off on orders above ₹2,499', expiresAt: new Date('2027-12-31') },
    { code: 'FESTIVE30', type: 'percent', valueInPaise: 30, minCartValueInPaise: 199900, maxDiscountInPaise: 80000, description: '30% off on Ethnic and Festive wear up to ₹800', expiresAt: new Date('2027-12-31') },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }
  console.log(`Seeded ${couponsData.length} Coupons`);

  console.log('--- Database Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
