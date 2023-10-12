import mongoose from 'mongoose';
import { stringType }from './common/commonTypes.js';


const PopupSchema = mongoose.model('popups', new mongoose.Schema({
    coupon      : stringType,
    image1      : stringType,
    image2      : stringType,
    line1       : stringType,
    line2       : stringType,
    line3       : stringType
}, { timestamps: true }))

export { PopupSchema };