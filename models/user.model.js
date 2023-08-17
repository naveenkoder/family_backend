import mongoose from 'mongoose';
import { stringType, emailType, booleanType, addressType, deviceType, cartType, socialType } from './common/commonTypes.js';
const UserSchema = mongoose.model('users', new mongoose.Schema({
    loginType: socialType,
    socialId: stringType,
    name: stringType,
    email: emailType,
    profile: stringType,
    deviceType,
    deviceToken: stringType,
    otp: stringType,
    address: addressType,
    isBlock: booleanType,
}, { timestamps: true }))

export { UserSchema };