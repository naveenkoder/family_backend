import mongoose from 'mongoose';
import { stringType } from './common/commonTypes.js';
const ContentSchema = mongoose.model('contents', new mongoose.Schema({
    privacy: stringType,
    term: stringType,
}, { timestamps: true }))

export { ContentSchema };