import { Schema, model } from 'mongoose';

const outletSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  website: { type: String, default: '' },
  domain: { type: String, default: '' },
  metadata: { type: Schema.Types.Mixed, default: {} },
  lastScrapedAt: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

outletSchema.virtual('journalists', {
  ref: 'Journalist', localField: '_id', foreignField: 'outlet'
});

outletSchema.index({ domain: 1 });

export default model('Outlet', outletSchema);
