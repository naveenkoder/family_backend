import mongoose from 'mongoose';
import { stringType } from './common/commonTypes.js';
const TestimonialSchema = mongoose.model('testimonials', new mongoose.Schema({
    media: stringType,
    text: stringType,
}, { timestamps: true }))

export { TestimonialSchema };