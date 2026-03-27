import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminSession extends Document {
  otp: string;
  isVerified: boolean;
  expiresAt: Date;
  attemptId: string;
}

const AdminSessionSchema: Schema = new Schema({
  otp: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true, index: { expires: '10m' } }, // Automatically clean up after 10 mins
  attemptId: { type: String, required: true, unique: true },
});

export default mongoose.models.AdminSession || mongoose.model<IAdminSession>('AdminSession', AdminSessionSchema);
