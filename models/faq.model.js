import mongoose from 'mongoose';
import { stringType } from './common/commonTypes.js';
const FaqSchema = mongoose.model('faqs', new mongoose.Schema({
    question: stringType,
    answer: stringType,
}, { timestamps: true }))

export { FaqSchema };