import fs from 'fs';
import { UserSchema } from '../../models/user.model.js';
import { OrderSchema } from '../../models/order.model.js';
import { PromoSchema } from '../../models/promo.model.js';
import moment from 'moment';
import {
    createErrorResponse,
    createSuccessResponse,
    generateOrderId,
    generateOtp,
    generatePromoCode,
    generateToken,
    parseToMongoObjectID
} from '../../helpers/utils.js';
import { statusCode } from '../../constant/statusCode.js';
import { messages } from '../../constant/message.js';
import { fileUplaodOnFirebase } from '../../helpers/firebaseHelper.js';
import { PromoOfferSchema } from '../../models/promoOffer.model.js';
import { calculateGrandTotal } from '../../helpers/mongooseHelper.js';
import { mailSender } from '../../helpers/mailHelper.js';
import { ContentSchema } from '../../models/content.model.js';
import { doPayment } from '../../helpers/stripe.js';
import { sendSMS } from '../../helpers/sms.js';
import { doShipment } from '../../helpers/shipment.js';
import { invoiceLogger, orderLogger } from '../../config/logger.js';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL;

export const signUpWithSocial = async (req, res) => {
    const { data, loginType } = req.body;
    const { email, id, name, picture, deviceType, deviceToken } = data;
    const existUser = await UserSchema.findOne({ socialId: id });
    if (existUser) {
        const { _id, socialId } = existUser;
        existUser['deviceType'] = deviceType;
        existUser['deviceToken'] = deviceToken;
        existUser['loginType'] = loginType;
        existUser['email'] = email;
        if (picture) existUser['profile'] = picture;
        if (name) existUser['name'] = name;
        await existUser.save();
        const token = generateToken({ _id, socialId, deviceType, deviceToken, type: "user" })
        return res.status(statusCode.success).json(createSuccessResponse(messages.loginSuccess, { _id, token, socialId, name: existUser['name'], email, profile: existUser['profile'], loginType }))
    } else {
        const newData = Object.assign({});
        newData['socialId'] = id;
        newData['deviceType'] = deviceType;
        newData['deviceToken'] = deviceToken;
        newData['loginType'] = loginType;
        newData['email'] = email;
        if (picture) newData['profile'] = picture;
        if (name) newData['name'] = name;
        UserSchema(newData).save()
            .then(newUser => {
                const { socialId, name, email, profile, _id } = newUser;
                const token = generateToken({ _id, socialId, deviceType, deviceToken, type: "user" })
                return res.status(statusCode.success).json(createSuccessResponse(messages.loginSuccess, { _id, token, socialId, name, email, loginType, profile }))
            }).catch(error => {
                return res.status(statusCode.error).json(createErrorResponse(error?.message))
            })
    }
}

export const profile = async (req, res) => {
    const { socialId, name, email, profile, _id, loginType } = req.user;
    return res.status(statusCode.success).json(createSuccessResponse(messages.loginSuccess, { _id, socialId, name, email, profile, loginType }))
}

export const fileUpload = async (req, res) => {
    const files = req.files;
    if (files.length > 0) {
        const allPromises = [];
        for (let i of files) allPromises.push(fileUplaodOnFirebase(i))
        Promise.all(allPromises)
            .then(success => {
                return res.status(statusCode.success).json(createSuccessResponse(messages.fileUploadSuccess, success))
            }).catch(error => {
                return res.status(statusCode.error).json(createErrorResponse(error?.message))
            })
    } else return res.status(statusCode.error).json(createErrorResponse(messages.selectFile))
}

export const placeOrder = async (req, res) => {
    const { promo, products, token } = req.body;
    if (products.length > 0) {
        const orderFunc = async (promoDetail) => {
            const receiptId = generateOrderId();
            const grandTotal = await calculateGrandTotal(products, promoDetail?.offer)
            const { totalCost } = grandTotal;
            if (totalCost > 0) {
                doPayment(totalCost, token, 'Buy Frames', receiptId)
                    .then(async success => {
                        console.log('success', success)
                        await OrderSchema({
                            orderId: success?.id,
                            receiptId,
                            promo: promoDetail ? promoDetail._id : null,
                            cart: products,
                            user: req.user._id,
                            totalPrice: totalCost
                        }).save();
                        req.body = {
                            orderId: success?.id,
                            status: true,
                            data: success
                        }
                        orderStatusController(req, res)
                    })
                    .catch(err => {
                        console.log('err', err)
                        return res.status(statusCode.error).json(createErrorResponse(err.message))
                    })
            } else {
                await OrderSchema({
                    orderId: receiptId,
                    receiptId,
                    promo: promoDetail ? promoDetail._id : null,
                    cart: products,
                    user: req.user._id,
                    totalPrice: totalCost
                }).save();
                return res.status(statusCode.success).json(createSuccessResponse(messages.orderPlaced, { isFree: true, id: receiptId }))
            }
        }
        if (promo) {
            const checkPromo = await PromoSchema.findOne({ code: promo, isExpire: null }).populate('offer');
            if (!checkPromo) return res.status(statusCode.error).json(createErrorResponse(messages.wrongPromo))
            else orderFunc(checkPromo);
        } else orderFunc();
    } else return res.status(statusCode.error).json(createErrorResponse(messages.cartEmpty))
}

export const myOrders = async (req, res) => {
    let { offset, limit } = req.body;
    offset = offset ? offset : 0
    limit = limit ? limit : 10
    const aggregation = [
        {
            $match: {
                payment: true,
                isDeleted: null,
                user: parseToMongoObjectID(req.user._id)
            }
        },
        {
            $lookup: {
                from: 'promos',
                let: { 'promoId': '$promo' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$promoId']
                            }
                        }
                    },
                    {
                        $project: {
                            code: 1,
                            type: 1,
                            discount: 10,
                            user: 1
                        }
                    }
                ],
                as: 'promo'
            }
        },
        {
            $unwind: {
                path: '$promo',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                totalPrice: 1,
                orderId: 1,
                receiptId: 1,
                user: 1,
                cart: 1,
                promo: { $cond: ['$promo', '$promo', null] },
                createdAt: 1,
                shiprocket: 1,
                status: 1
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: offset },
        { $limit: limit }
    ]
    const orders = await OrderSchema.aggregate(aggregation);
    return res.status(statusCode.success).json(createSuccessResponse(messages.ordersFetch, orders))
}

export const viewAddress = async (req, res) => {
    return res.status(statusCode.success).json(createSuccessResponse(messages.viewAddress, req.user.address))
}

export const addAddress = async (req, res) => {
    const { email, name, country, street, phone, lastName, city, pincode, state } = req.body;
    req.user.address = {
        email: email ? email : null,
        name: name ? name : null,
        country: country ? country : null,
        street: street ? street : null,
        phone: phone ? phone : null,
        lastName: lastName ? lastName : null,
        city: city ? city : null,
        pincode: pincode ? pincode : null,
        state: state ? state : null,
    }
    await req.user.save();
    return res.status(statusCode.success).json(createSuccessResponse(messages.addressUpdated))
}

export const getPromoOrderId = async (req, res) => {
    const { id, token, email } = req.body;
    const checkOffer = await PromoOfferSchema.findOne({ _id: id });
    if (checkOffer) {
        const code = generatePromoCode();
        doPayment(checkOffer.discount, token, 'Buy Promo', code)
            .then(async success => {
                req.body = {
                    email,
                    id,
                    data: success
                }
                buyPromo(req, res)
            })
            .catch(err => {
                return res.status(statusCode.error).json(createErrorResponse(err.message))
            })
    } else return res.status(statusCode.error).json(createErrorResponse(messages.promoNotFound))
}

export const buyPromo = async (req, res) => {
    const { email, id, data } = req.body;
    const checkOffer = await PromoOfferSchema.findOne({ _id: id });
    if (checkOffer) {
        const code = generatePromoCode();
        const userEmail = req.user.email;
        const promo = { code, email, offer: id }
        if (data) promo['data'] = JSON.stringify(data)
        fs.readFile('html/promo.html', 'utf-8', async (err, data) => {
            if (err) return res.status(statusCode.error).json(createErrorResponse(messages.mailNotSent))
            else {
                await new PromoSchema(promo).save();
                let templete = data.replace(/EMAIL/g, email)
                    .replace(/PROMO/g, code)
                    .replace(/FRAMES/g, checkOffer.noOfFrames)
                    .replace(/CURRENT_YEAR/g, moment().utc().format('YYYY'))
                mailSender(email, "Promos", templete)
                    .then(success => {
                        if (userEmail !== email) {
                            fs.readFile('html/promoCopy.html', 'utf-8', async (err, data) => {
                                if (!err) {
                                    let templete = data.replace(/EMAIL/g, userEmail)
                                        .replace(/RECEIVER/g, email)
                                        .replace(/CURRENT_YEAR/g, moment().utc().format('YYYY'))
                                    mailSender(userEmail, "Promos", templete)
                                        .then(success => console.log('promo copy success'))
                                        .catch(err => console.log(err?.message))
                                }
                            })
                        }
                        return res.status(statusCode.success).json(createSuccessResponse(messages.promoPurchased))
                    })
                    .catch(err => { return res.status(statusCode.error).json(createErrorResponse(err?.message)) })
            }
        })
    } else return res.status(statusCode.error).json(createErrorResponse(messages.promoNotFound))
}

export const promoValidity = async (req, res) => {
    const { promo } = req.body;
    const checkPromo = await PromoSchema.findOne({ code: promo, isExpire: null });
    return res.status(statusCode.success).json(createSuccessResponse(messages.promoStatus, { isValid: checkPromo ? true : false }))
}

export const promoList = async (req, res) => {
    const { promo } = req.body;
    const promos = await PromoOfferSchema.find().select('noOfFrames discount')
    return res.status(statusCode.success).json(createSuccessResponse(messages.promoFetch, promos))
}

export const checkOrderPrice = async (req, res) => {
    const { promo, products } = req.body;
    if (products.length > 0) {
        const orderFunc = async (promoDetail) => {
            const grandTotal = await calculateGrandTotal(products, promoDetail?.offer)
            return res.status(statusCode.success).json(createSuccessResponse(messages.orderCheck, grandTotal))
        }
        if (promo) {
            const checkPromo = await PromoSchema.findOne({ code: promo, isExpire: null }).populate('offer');
            if (!checkPromo) return res.status(statusCode.error).json(createErrorResponse(messages.wrongPromo))
            else orderFunc(checkPromo);
        } else orderFunc();
    } else return res.status(statusCode.error).json(createErrorResponse(messages.cartEmpty))
}

export const getBasicInfo = async (req, res) => {
    const webInfo = await ContentSchema.aggregate([
        {
            $lookup: {
                from: 'faqs',
                pipeline: [
                    {
                        $project: {
                            answer: 1,
                            question: 1
                        }
                    }
                ],
                as: 'faq'
            }
        },
        {
            $lookup: {
                from: 'testimonials',
                pipeline: [
                    {
                        $project: {
                            media: 1,
                            text: 1,
                            createdAt: 1
                        }
                    }
                ],
                as: 'testimonial'
            }
        },
        {
            $lookup: {
                from: 'promoOffers',
                pipeline: [
                    {
                        $project: {
                            noOfFrames: 1,
                            discount: 1
                        }
                    }
                ],
                as: 'promoOffer'
            }
        },
        {
            $lookup: {
                from: 'discounts',
                pipeline: [
                    {
                        $project: {
                            freeDeliveryPrice: 1,
                            shippingCharge: 1,
                            framePrice: 1,
                            siteOfferPrice: 1,
                            siteOfferDiscount: 1
                        }
                    }
                ],
                as: 'discount'
            }
        },
        {
            $unwind: {
                path: '$discount',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'homepages',
                pipeline: [
                    {
                        $project: {
                            firstContent: 1,
                            secondContent: 1,
                            instragram: 1,
                            twitter: 1,
                            facebook: 1,
                            youTube: 1,
                            pinterest: 1
                        }
                    }
                ],
                as: 'homepage'
            }
        },
        {
            $unwind: {
                path: '$homepage',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                content: {
                    term: '$term',
                    privacy: '$privacy'
                },
                discount: 1,
                homepage: 1,
                promoOffers: 1,
                faq: 1,
                testimonial: 1
            }
        }
    ])
    return res.status(statusCode.success).json(createSuccessResponse(messages.webInfo, webInfo[0]))
}

export const orderStatusController = async (req, res) => {
    const { orderId, status, data } = req.body;
    const address = req.user.address;
    if (address?.email && address?.name && address?.lastName && address?.city && address?.pincode && address?.state && address?.phone && address?.country && address?.street) {
        const checkOrder = await OrderSchema.findOne({ orderId, user: req.user._id, isDeleted: null });
        if (!checkOrder) return res.status(statusCode.error).json(createErrorResponse(messages.orderNotFound))
        else {
            if (data) checkOrder['data'] = JSON.stringify(data);
            checkOrder['payment'] = status;
            await checkOrder.save();
            if (status) {
                let offer = '';
                if (checkOrder?.promo) {
                    let promo = await PromoSchema.findOne({ _id: checkOrder?.promo }).populate('offer');
                    if (promo) {
                        if (promo.offer) offer = promo.offer;
                        promo['isExpire'] = new Date();
                        await promo.save();
                    }
                }
                const orderPayload = {
                    order_id: checkOrder?.orderId,
                    order_date: moment().add(5, 'hour').format('YYYY-MM-DD HH:mm'),
                    pickup_location: "Primary",
                    company_name: "Family Vibes",
                    billing_customer_name: address?.name,
                    billing_last_name: address?.lastName,
                    billing_address: address?.street,
                    billing_city: address?.city,
                    billing_pincode: address?.pincode,
                    billing_state: address?.state,
                    billing_country: address?.country,
                    billing_email: address?.email,
                    billing_phone: address?.phone,
                    shipping_is_billing: 1,
                    order_items: [
                        {
                            name: "Frames",
                            sku: "001",
                            units: checkOrder?.cart?.length || 1,
                            selling_price: checkOrder?.totalPrice,
                            discount: 0
                        }
                    ],
                    payment_method: "Prepaid",
                    sub_total: checkOrder?.totalPrice,
                    length: 20,
                    breadth: 20,
                    height: 9,
                    weight: 1
                }
                orderLogger.info('New order', { payload: orderPayload, orderId: checkOrder._id, userId: req.user._id })
                doShipment(orderPayload)
                    .then(async shipment => {
                        if (shipment.success) {
                            await OrderSchema.updateOne({ _id: checkOrder._id }, {
                                shiprocket: {
                                    orderId: shipment?.data?.response?.data?.order_id,
                                    shipmentId: shipment?.data?.response?.data?.shipment_id,
                                    awbCode: shipment?.data?.response?.data?.awb_code
                                }
                            });
                            const grandTotalInfo = await calculateGrandTotal(checkOrder.cart, offer)

                            fs.readFile('html/invoice.html', 'utf-8', async (err, data) => {
                                if (err) invoiceLogger.error('Error', { payload: orderPayload, orderId: checkOrder._id, userId: req.user._id, error: err?.message })
                                else {
                                    let templete = data
                                        .replace(/CLIENT_NAME/g, address?.name)
                                        .replace(/TOTAL_COST/g, checkOrder?.totalPrice)
                                        .replace(/INVOICE_DATE/g, moment().format('MM/DD/YYYY'))
                                        .replace(/CLIENT_ADDRESS/g, address?.street)
                                        .replace(/CITY/g, address?.city)
                                        .replace(/STATE/g, address?.state)
                                        .replace(/COUNTRY/g, address?.country)
                                        .replace(/PINCODE/g, address?.pincode)
                                        .replace(/INVOICE_NUMBER/g, orderId)
                                        .replace(/QUANTITY/g, checkOrder?.cart?.length)
                                        .replace(/ACTUAL_COST/g, grandTotalInfo?.framePrice * checkOrder?.cart?.length)
                                        .replace(/DISCOUNT/g, (grandTotalInfo?.framePrice * checkOrder?.cart?.length + grandTotalInfo?.shippingCharges) - checkOrder?.totalPrice)
                                        .replace(/SHIPPING_CHARGES/g, grandTotalInfo?.shippingCharges)
                                        .replace(/CURRENT_YEAR/g, moment().utc().format('YYYY'))
                                    mailSender([address?.email, CONTACT_EMAIL], "Inovice", templete)
                                        .then(success => invoiceLogger.info('Success', { payload: orderPayload, orderId: checkOrder._id, userId: req.user._id }))
                                        .catch(err => invoiceLogger.error('Error', { payload: orderPayload, orderId: checkOrder._id, userId: req.user._id, error: err?.message }))
                                }
                            })
                            return res.status(statusCode.success).json(createSuccessResponse(messages.orderStatus))
                        } else {
                            return res.status(statusCode.error).json(createErrorResponse(shipment?.message))
                        }
                    })
                    .catch(error => {
                        return res.status(statusCode.error).json(createErrorResponse(error?.message))
                    })
            } else return res.status(statusCode.success).json(createSuccessResponse(messages.orderStatus))
        }
    } else return res.status(statusCode.error).json(createErrorResponse(messages.completeAddress))
}

export const sendOtp = async (req, res) => {
    const { phone } = req.body;
    const otp = generateOtp();
    req.user.otp = otp;
    sendSMS(`${phone}`, otp)
        .then(async data => {
            await req.user.save();
            return res.status(statusCode.success).json(createSuccessResponse(messages.otpSent))
        })
        .catch(err => {
            return res.status(statusCode.error).json(createSuccessResponse(err?.messages))
        })
}

export const verifyOtp = async (req, res) => {
    const { otp } = req.body;
    if (req.user.otp == otp) {
        req.user.otp = null;
        await req.user.save();
        return res.status(statusCode.success).json(createSuccessResponse(messages.otpVerify))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.otpNotMatch))
}

export const contactUs = async (req, res) => {
    const { firstName, lastName, phone, email, message } = req.body;
    fs.readFile('html/contact.html', 'utf-8', async (err, data) => {
        if (err) return res.status(statusCode.error).json(createErrorResponse(messages.mailNotSent))
        else {
            let templete = data.replace(/FIRST_NAME/g, firstName)
                .replace(/LAST_NAME/g, lastName)
                .replace(/PHONE/g, phone)
                .replace(/EMAIL/g, email)
                .replace(/MESSAGE/g, message)
                .replace(/CURRENT_YEAR/g, moment().utc().format('YYYY'))
            mailSender(CONTACT_EMAIL, "Contact Us", templete)
                .then(success => {
                    return res.status(statusCode.success).json(createSuccessResponse(messages.contactSuccess))
                })
                .catch(err => { return res.status(statusCode.error).json(createErrorResponse(err?.message)) })
        }
    })
}