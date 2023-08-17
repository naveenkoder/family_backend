import mongoose from 'mongoose';
import { numberType, stringType } from './common/commonTypes.js';
const DiscountSchema = mongoose.model('discounts', new mongoose.Schema({
    freeDeliveryPrice: numberType,
    shippingCharge: numberType,
    framePrice: numberType,
    siteOfferPrice: numberType,
    siteOfferDiscount: numberType
}, { timestamps: true }))

export { DiscountSchema };