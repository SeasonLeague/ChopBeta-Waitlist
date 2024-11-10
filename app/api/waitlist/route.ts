import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Waitlist from '../../models/Waitlist';
import * as EmailJSServer from '@emailjs/nodejs';

// Initialize EmailJS with your credentials
const emailjsConfig = {
  publicKey: process.env.EMAILJS_PUBLIC_KEY!,
  privateKey: process.env.EMAILJS_PRIVATE_KEY!,
};

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Ensure MongoDB connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    // Check if email already exists
    const existingUser = await Waitlist.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists in the waitlist' }, { status: 400 });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // Send verification email using EmailJS Node.js SDK
      const emailResponse = await EmailJSServer.send(
        process.env.EMAILJS_SERVICE_ID!, // Your EmailJS service ID
        process.env.EMAILJS_TEMPLATE_ID!, // Your EmailJS template ID
        {
          to_email: email,
          to_name: name,
          verification_code: verificationCode,
        },
        emailjsConfig // Pass the config object here
      );

      if (emailResponse.status !== 200) {
        throw new Error('Failed to send email');
      }

      // Only save to database if email was sent successfully
      const newEntry = new Waitlist({ name, email, verificationCode });
      await newEntry.save();

      return NextResponse.json({ 
        success: true,
        message: 'Successfully joined the waitlist. Please check your email to verify.' 
      }, { status: 201 });

    } catch (emailError: any) {
      console.error('Email sending failed:', emailError);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to send verification email. Please try again.' 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'An error occurred while joining the waitlist' 
    }, { status: 500 });
  }
}

// // api/waitlist/route.ts
// import { NextResponse } from 'next/server';
// import mongoose from 'mongoose';
// import Waitlist from '../../models/Waitlist';
// import nodemailer from 'nodemailer';

// export async function POST(req: Request) {
//   try {
//     const { name, email } = await req.json();

//     if (!name || !email) {
//       return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
//     }

//     // Ensure MongoDB connection
//     if (!mongoose.connections[0].readyState) {
//       await mongoose.connect(process.env.MONGODB_URI as string);
//     }

//     // Check if email already exists
//     const existingUser = await Waitlist.findOne({ email });
//     if (existingUser) {
//       return NextResponse.json({ error: 'Email already exists in the waitlist' }, { status: 400 });
//     }

//     const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

//     // Create Nodemailer transporter
//     const transporter = nodemailer.createTransport({
//       service: 'gmail', // or your email service
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS // Use an app-specific password
//       }
//     });

//     try {
//       // Save to database first
//       const newEntry = new Waitlist({ name, email, verificationCode });
//       await newEntry.save();

//       // Send verification email
//       await transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: 'Verify Your Email for Chop Beta',
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <h2>Welcome to Chop Beta!</h2>
//             <p>Hey ${name},</p>
//             <p>Thank you for joining our waitlist! To complete your registration, please use this verification code:</p>
//             <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
//               ${verificationCode}
//             </div>
//             <p>This code will expire in 24 hours.</p>
//             <p>If you didn't request this, please ignore this email.</p>
//             <p>Best regards,<br>The Chop Beta Team</p>
//           </div>
//         `
//       });

//       return NextResponse.json({ 
//         success: true,
//         message: 'Successfully joined the waitlist. Please check your email to verify.' 
//       }, { status: 201 });

//     } catch (emailError) {
//       // If email fails, delete the waitlist entry
//       await Waitlist.deleteOne({ email });
//       console.error('Email sending failed:', emailError);
//       return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
//     }

//   } catch (error: any) {
//     console.error('Waitlist error:', error);
//     return NextResponse.json({ 
//       success: false,
//       error: 'An error occurred while joining the waitlist' 
//     }, { status: 500 });
//   }
// }