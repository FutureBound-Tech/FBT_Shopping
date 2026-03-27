import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia {
  url: string;
  type: 'image' | 'video';
  public_id: string;
}

export interface IProduct extends Document {
  title: string;
  description: string;
  rawDescription: string;
  category: 'saree' | 'dress';
  price: number;
  media: IMedia[];
  colors: string[];
  sizes: string[];
  fabric: string;
  highlights: string[];
  pageContent: string;
  views: number;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, required: true },
    rawDescription: { type: String, default: '' },
    category: { type: String, enum: ['saree', 'dress'], required: true },
    price: { type: Number, default: 0 },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true },
        public_id: { type: String, required: true },
      },
    ],
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    fabric: { type: String, default: '' },
    highlights: { type: [String], default: [] },
    pageContent: { type: String, default: '' },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
