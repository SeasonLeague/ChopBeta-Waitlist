import mongoose from 'mongoose';

const WaitlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  verificationCode: { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Waitlist = mongoose.models.Waitlist || mongoose.model('Waitlist', WaitlistSchema);

export default Waitlist;