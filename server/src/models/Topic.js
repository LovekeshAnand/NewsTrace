import { Schema, model } from 'mongoose';

const topicSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true, lowercase: true },
  category: String,
  articleCount: { type: Number, default: 0 }
}, { timestamps: true });

export default model('Topic', topicSchema);
