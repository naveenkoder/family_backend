import mongoose from 'mongoose';
import { stringType, emailType, numberType, joinSchema, booleanType, dateType } from './common/commonTypes.js';
const PromoSchema = mongoose.model('promos', new mongoose.Schema({
    code: stringType,
    data: stringType,
    offer: joinSchema('promoOffers'),
    isExpire: dateType,
    email: emailType,
}, { timestamps: true }))

export { PromoSchema };