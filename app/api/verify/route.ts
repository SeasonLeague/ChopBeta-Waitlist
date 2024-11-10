import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Waitlist from '../../models/Waitlist';

export async function POST(req: Request) {
  try {
    const { email, verificationCode } = await req.json();

    if (!email || !verificationCode) {
      return NextResponse.json({ 
        success: false,
        error: 'Email and verification code are required' 
      }, { status: 400 });
    }

    // Ensure MongoDB connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    const entry = await Waitlist.findOne({ email, verificationCode });

    if (!entry) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid email or verification code' 
      }, { status: 400 });
    }

    if (entry.verified) {
      return NextResponse.json({ 
        success: true,
        message: 'Email already verified' 
      }, { status: 200 });
    }

    entry.verified = true;
    await entry.save();

    return NextResponse.json({ 
      success: true,
      message: 'Email successfully verified' 
    }, { status: 200 });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'An error occurred while verifying the email' 
    }, { status: 500 });
  }
}