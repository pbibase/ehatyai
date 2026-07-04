import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    // Check for cooldown (e.g. 30 seconds)
    const recentOtp = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gt: new Date(Date.now() - 30000) // created in last 30s
        }
      }
    });

    if (recentOtp) {
      return NextResponse.json({ 
        error: 'Please wait before requesting another OTP code.' 
      }, { status: 429 });
    }

    // Generate new OTP
    const otpCode = '123456'; // Default bypass for easy testing
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt,
        type: 'email'
      }
    });

    console.log(`\n======================================================`);
    console.log(`[SIMULATED SMS/EMAIL GATEWAY] (RESEND)`);
    console.log(`OTP Code for ${user.email}: ${otpCode}`);
    console.log(`======================================================\n`);

    return NextResponse.json({ success: true, message: 'New OTP sent successfully' });
  } catch (error: any) {
    console.error('OTP Resend Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
