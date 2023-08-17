import mongoose from 'mongoose';
export const deviceTypeEnum = {
    ios: 'ios',
    android: 'android'
}

export const orderStatusEnum = {
    pending: 'pending',
    inProgress: 'inProgress',
    delivered: 'delivered'
}

export const socialTypeEnum = {
    google: 'google'
}

export const stringType = {
    type: String,
    trim: true,
    default: null
}

export const numberType = {
    type: Number,
    trim: true,
    default: null
}

export const emailType = {
    type: String,
    lowercase: true,
    trim: true,
    default: null
}

export const booleanType = {
    type: Boolean,
    default: false
}

export const dateType = {
    type: Date,
    default: null
}

export const joinSchema = (schemaName) => {
    return {
        type: mongoose.Schema.Types.ObjectId,
        ref: schemaName
    }
}

export const deviceType = {
    type: String,
    enum: [...Object.keys(deviceTypeEnum), null],
    default: null
}

export const orderStatusType = {
    type: String,
    enum: Object.keys(orderStatusEnum),
    default: orderStatusEnum.pending
}

export const socialType = {
    type: String,
    enum: [...Object.keys(socialTypeEnum)],
    default: socialTypeEnum.google
}

export const cartType = [{
    quantity: numberType,
    frame: stringType,
    picture: stringType
}]

export const addressType = {
    email: stringType,
    name: stringType,
    lastName: stringType,
    city: stringType,
    pincode: stringType,
    state: stringType,
    phone: stringType,
    country: stringType,
    street: stringType
}