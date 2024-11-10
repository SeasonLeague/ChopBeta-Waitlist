import mongoose from 'mongoose';

const WaitlistSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  verificationCode: { 
    type: String, 
    required: true 
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Add index on email field
WaitlistSchema.index({ email: 1 });

const Waitlist = mongoose.models.Waitlist || mongoose.model('Waitlist', WaitlistSchema);

export default Waitlist;