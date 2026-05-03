import { Schema, model } from 'mongoose';

const scrapeJobSchema = new Schema({
  outlet: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending', index: true },
  progress: { type: Number, default: 0 },
  totalFound: { type: Number, default: 0 },
  errorLog: Schema.Types.Mixed,
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  metadata: Schema.Types.Mixed
});

export default model('ScrapeJob', scrapeJobSchema);
