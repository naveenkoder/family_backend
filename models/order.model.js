import mongoose from 'mongoose';
import { stringType, booleanType, orderStatusType, cartType, numberType, joinSchema, dateType } from './common/commonTypes.js';
const OrderSchema = mongoose.model('orders', new mongoose.Schema({
    orderId: stringType,
    receiptId: stringType,
    shiprocket: {
        orderId: stringType,
        shipmentId: stringType,
        awbCode: stringType
    },
    user: joinSchema('users'),
    cart: cartType,
    promo: joinSchema('promos'),
    payment: booleanType,
    totalPrice: numberType,
    data: stringType,
    status: orderStatusType,
    isDeleted: dateType
}, { timestamps: true }))

export { OrderSchema };