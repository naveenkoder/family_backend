import mongoose from 'mongoose';
import { stringType } from './common/commonTypes.js';
const HomepageSchema = mongoose.model('homepages', new mongoose.Schema({
    firstContent: {
        links: [stringType],
        title: stringType,
        description: stringType,
    },
    secondContent: {
        links: [stringType],
        title: stringType,
        description: stringType,
    },
    instragram: stringType,
    twitter: stringType,
    facebook: stringType,
    youTube: stringType,
    pinterest: stringType
}, { timestamps: true }))

export { HomepageSchema };