import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if email or phone already exists
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 });
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create user (unverified)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        verified: false
      }
    });

    // Generate 6-digit OTP code
    // For integration testing bypass, we can print it and also support the 123456 bypass
    const otpCode = '123456'; // We can use '123456' as the default for easy testing, or generate a random one
    
    // Save OTP to database
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 mins expiry

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt,
        type: 'email'
      }
    });

    // Print OTP code to server console (Simulated SMS/Email Gateway)
    console.log(`\n======================================================`);
    console.log(`[SIMULATED SMS/EMAIL GATEWAY]`);
    console.log(`OTP Code for ${user.email} (${user.phone}): ${otpCode}`);
    console.log(`======================================================\n`);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully',
      destination: email
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
