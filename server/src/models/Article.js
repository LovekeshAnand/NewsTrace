import { Schema, model } from 'mongoose';

const articleSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  publishedDate: Date,
  section: String,
  keywords: [String],
  entities: { type: Schema.Types.Mixed, default: {} },
  journalist: { type: Schema.Types.ObjectId, ref: 'Journalist', required: true, index: true },
  topics: [{ name: String, relevance: { type: Number, default: 1.0 } }]
}, { timestamps: true });

articleSchema.index({ publishedDate: -1 });

export default model('Article', articleSchema);
