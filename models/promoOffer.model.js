import mongoose from 'mongoose';
import { numberType } from './common/commonTypes.js';
const PromoOfferSchema = mongoose.model('promoOffers', new mongoose.Schema({
    noOfFrames: numberType,
    discount: numberType,
}, { timestamps: true }))

export { PromoOfferSchema };