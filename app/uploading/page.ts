import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Waitlist from '../../models/Waitlist';
import emailjs from '@emailjs/nodejs';

emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    await mongoose.connect(process.env.MONGODB_URI as string);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newEntry = new Waitlist({ name, email, verificationCode });
    await newEntry.save();

    // Send verification email using EmailJS
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID as string,
      process.env.EMAILJS_TEMPLATE_ID as string,
      {
        to_email: email,
        to_name: name,
        verification_code: verificationCode,
      }
    );

    return NextResponse.json({ message: 'Successfully joined the waitlist. Please check your email to verify.' }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email already exists in the waitlist' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An error occurred while joining the waitlist' }, { status: 500 });
  }
}