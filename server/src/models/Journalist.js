import { Schema, model } from 'mongoose';

const journalistSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: String,
  profileUrl: String,
  bio: String,
  imageUrl: String,
  twitter: String,
  linkedin: String,
  outlet: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
  articleCount: { type: Number, default: 0 },
  lastArticleDate: Date,
  beats: [{ topic: String, articleCount: { type: Number, default: 0 } }]
}, { timestamps: true });

journalistSchema.index({ name: 1, outlet: 1 }, { unique: true });
journalistSchema.index({ name: 'text', bio: 'text' });
journalistSchema.index({ articleCount: -1 });

export default model('Journalist', journalistSchema);
