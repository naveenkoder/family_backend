import mongoose from 'mongoose';
import { stringType, socialType, booleanType } from './common/commonTypes.js';
const AdminSchema = mongoose.model('admins', new mongoose.Schema({
    email: stringType,
    password: stringType,
    deviceToken: stringType,
    forgotPasswordToken: stringType,
    forgotPassword: booleanType,
}, { timestamps: true }))

export { AdminSchema };