import { AdminSchema } from '../../models/admin.model.js';
import { UserSchema } from '../../models/user.model.js';
import { ContentSchema } from '../../models/content.model.js';
import { OrderSchema } from '../../models/order.model.js';
import fs from 'fs';
import moment from 'moment';
import { mailSender } from '../../helpers/mailHelper.js';
import { messages } from '../../constant/message.js';
import { comparePassword, createErrorResponse, createSuccessResponse, generateToken, hashPassword, paginationData, parseToMongoObjectID, uuidv4_10, verifyToken } from '../../helpers/utils.js';
import { statusCode } from '../../constant/statusCode.js';
import { FaqSchema } from '../../models/faq.model.js';
import { DiscountSchema } from '../../models/discount.model.js';
import { HomepageSchema } from '../../models/homepage.model.js';
import { TestimonialSchema } from '../../models/testimonial.model.js';
import { cancelOrder } from '../../helpers/shipment.js';
const PANEL_URL = process.env.PANEL_URL;

export const login = async (req, res) => {
    const { email, password } = req.body;
    const admin = await AdminSchema.findOne({ email })
    if (admin) {
        let passwordMatch = await comparePassword(password, admin.password)
        if (passwordMatch) {
            admin['deviceToken'] = uuidv4_10();
            await admin.save()
            const token = generateToken({ _id: admin._id, password: admin['password'], deviceToken: admin['deviceToken'], type: "admin" })
            return res.status(statusCode.success).json(createSuccessResponse(messages.loginSuccess, { token }))
        } else return res.status(statusCode.error).json(createErrorResponse(messages.invalidEmailAndPassword))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.invalidEmailAndPassword))
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const admin = await AdminSchema.findOne({ email })
    if (admin) {
        const token = await generateToken({ userId: admin._id, time: Date.now() })
        admin['forgotPasswordToken'] = token
        admin['forgotPassword'] = true
        await admin.save()
        fs.readFile('html/forgot.html', 'utf-8', (err, data) => {
            if (err) return res.status(statusCode.error).json(createErrorResponse(messages.mailNotSent))
            else {
                let templete = data.replace(/TOKEN/g, token)
                    .replace(/URL/g, PANEL_URL)
                    .replace(/CURRENT_YEAR/g, moment().utc().format('YYYY'))
                mailSender(admin.email, "Reset Password", templete)
                    .then(success => { return res.status(statusCode.success).json(createSuccessResponse(messages.forgotPasswordLinkSent)) })
                    .catch(err => { return res.status(statusCode.error).json(createErrorResponse(err?.message)) })
            }
        })
    } else return res.status(statusCode.error).json(createErrorResponse(messages.emailNotRegistered))
}

export const resetPasswordLink = async (req, res) => {
    const { token } = req.body;
    const tokenDetails = await verifyToken(token)
    if (tokenDetails) {
        const admin = await AdminSchema.findOne({ _id: tokenDetails.userId, forgotPassword: true })
        if (admin) {
            const { forgotPassword, forgotPasswordToken } = admin;
            if (forgotPassword && (forgotPasswordToken == token) && parseInt(Date.now()) - parseInt(tokenDetails.time) < 600000) return res.status(statusCode.success).json(createSuccessResponse(messages.linkFetched, { show: true }))
            else return res.status(statusCode.error).json(createErrorResponse(messages.linkExpired, { show: false }))
        } else return res.status(statusCode.error).json(createErrorResponse(messages.linkExpired, { show: false }))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.linkExpired, { show: false }))
}

export const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    const tokenDetails = await verifyToken(token)
    if (tokenDetails) {
        const admin = await AdminSchema.findOne({ _id: tokenDetails.userId, forgotPassword: true })
        if (admin) {
            const { forgotPassword, forgotPasswordToken } = admin;
            if (forgotPassword && (forgotPasswordToken == token) && parseInt(Date.now()) - parseInt(tokenDetails.time) < 600000) {
                admin['forgotPassword'] = false
                admin['forgotPasswordToken'] = null
                admin['password'] = await hashPassword(password)
                await admin.save()
                return res.status(statusCode.success).json(createSuccessResponse(messages.passwordChanged))
            } else return res.status(statusCode.error).json(createErrorResponse(messages.linkExpired))
        } else return res.status(statusCode.error).json(createErrorResponse(messages.linkExpired))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.linkExpired))
}

export const changePassword = async (req, res) => {
    const { oldPassword, password } = req.body;
    const user = req.user
    const oldPasswordMatched = await comparePassword(oldPassword, user?.password)
    if (oldPasswordMatched) {
        user['password'] = await hashPassword(password)
        await user.save()
        return res.status(statusCode.success).json(createSuccessResponse(messages.passwordChanged))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.incorrectOldPassword))
}

export const dashboard = async (req, res) => {
    const adminId = req.user._id;
    const aggregation = [
        {
            $match: {
                _id: parseToMongoObjectID(adminId)
            }
        },
        {
            $lookup: {
                from: 'users',
                let: {},
                pipeline: [],
                as: "users"
            }
        },
        {
            $lookup: {
                from: 'orders',
                let: {},
                pipeline: [],
                as: "orders"
            }
        },
        {
            $project: {
                _id: 1,
                orders: 1,
                users: {
                    $cond: [
                        { $eq: [{ $size: '$users' }, 0] },
                        {
                            lastWeek: 0,
                            lastMonth: 0,
                            lastYear: 0,
                        },
                        {
                            lastWeek: {
                                $size: {
                                    $filter: {
                                        input: "$users",
                                        as: "today",
                                        cond: {
                                            $and: [
                                                {
                                                    $gt: ["$$today.createdAt", new Date(moment().utc().startOf('isoWeek'))]
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            lastMonth: {
                                $size: {
                                    $filter: {
                                        input: "$users",
                                        as: "today",
                                        cond: {
                                            $and: [
                                                {
                                                    $gt: ["$$today.createdAt", new Date(moment().utc().startOf('month'))]
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            lastYear: {
                                $size: {
                                    $filter: {
                                        input: "$users",
                                        as: "today",
                                        cond: {
                                            $and: [
                                                {
                                                    $gt: ["$$today.createdAt", new Date(moment().utc().startOf('year'))]
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    ]
                },
                orders: {
                    $cond: [
                        { $eq: [{ $size: '$orders' }, 0] },
                        {
                            lastWeek: 0,
                            lastMonth: 0,
                            lastYear: 0,
                        },
                        {
                            lastWeek: {
                                $cond: [
                                    { $eq: [{ $size: '$orders' }, 0] },
                                    0,
                                    {
                                        $size: {
                                            $filter: {
                                                input: "$orders",
                                                as: "today",
                                                cond: {
                                                    $and: [
                                                        {
                                                            $gt: ["$$today.createdAt", new Date(moment().utc().startOf('isoWeek'))]
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                ]
                            },
                            lastMonth: {
                                $size: {
                                    $filter: {
                                        input: "$orders",
                                        as: "today",
                                        cond: {
                                            $and: [
                                                {
                                                    $gt: ["$$today.createdAt", new Date(moment().utc().startOf('month'))]
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            lastYear: {
                                $size: {
                                    $filter: {
                                        input: "$orders",
                                        as: "today",
                                        cond: {
                                            $and: [
                                                {
                                                    $gt: ["$$today.createdAt", new Date(moment().utc().startOf('year'))]
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        }
    ];
    const dashboard = await AdminSchema.aggregate(aggregation);
    return res.status(statusCode.success).json(createSuccessResponse(messages.dashboardFetched, dashboard[0]))
}

export const usersList = async (req, res) => {
    let { offset, limit, sort, order, search } = req.body;
    offset = offset ? offset : 0
    limit = limit ? limit : 10

    const aggregation = [
        {
            $project: {
                name: 1,
                profile: 1,
                email: 1,
                isBlock: 1,
                createdAt: 1
            }
        },
        ...(search && search !== '' ? [{
            $match: {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }
        }] : []),
        {
            $facet: {
                data: [
                    { $sort: { [sort ? sort : 'createdAt']: order ? order : -1 } },
                    { $skip: offset },
                    { $limit: limit }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        },
        {
            $unwind: {
                path: '$totalCount',
                preserveNullAndEmptyArrays: true
            }
        }
    ]
    const list = await UserSchema.aggregate(aggregation)
    const totalCount = list && list[0] && list[0].totalCount ? list[0].totalCount.count : 0
    const pagination = paginationData(totalCount, limit, offset)
    return res.status(statusCode.success).json(createSuccessResponse(messages.userListFetched, {
        list: list[0].data,
        pagination
    }))
}

export const userDetails = async (req, res) => {
    let details = await UserSchema.findOne({ _id: req.body.id }).select('name email isBlock profile loginType socialId createdAt')
    if (details) return res.status(statusCode.success).json(createSuccessResponse(messages.userListFetched, details))
    else return res.status(statusCode.error).json(createErrorResponse(messages.userNotFound))
}

export const editUserProfile = async (req, res) => {
    const { id, name } = req.body;
    const user = await UserSchema.findOne({ _id: id })
    if (user) {
        if (name) user['name'] = name
        await user.save()
        return res.status(statusCode.success).json(createSuccessResponse(messages.userDetailsUpdated))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.userNotFound))
}

export const blockUnblockUser = async (req, res) => {
    const user = await UserSchema.findOne({ _id: req.body.id })
    if (user) {
        let message = user.isBlock ? messages.userUnblocked : messages.userBlocked
        user['isBlock'] = user.isBlock ? false : true
        await user.save()
        return res.status(statusCode.success).json(createSuccessResponse(message, { isBlock: user['isBlock'] }))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.userNotFound))
}

export const ordersList = async (req, res) => {
    let { offset, limit, sort, order, search } = req.body;
    offset = offset ? offset : 0
    limit = limit ? limit : 10

    const aggregation = [
        {
            $match: {
                payment: true,
                isDeleted: null
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
            $lookup: {
                from: 'users',
                let: { 'userId': '$user' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$userId']
                            }
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            email: 1,
                            profile: 10,
                            address: 1
                        }
                    }
                ],
                as: 'user'
            }
        },
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                orderId: 1,
                receiptId: 1,
                cart: 1,
                user: 1,
                promo: { $cond: ['$promo', '$promo', null] },
                totalPrice: 1,
                status: 1,
                createdAt: 1
            }
        },
        ...(search && search !== '' ? [{
            $match: {
                $or: [
                    { orderId: { $regex: search, $options: 'i' } },
                    { status: { $regex: search, $options: 'i' } }
                ]
            }
        }] : []),
        {
            $facet: {
                data: [
                    { $sort: { [sort ? sort : 'createdAt']: order ? order : -1 } },
                    { $skip: offset },
                    { $limit: limit }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        },
        {
            $unwind: {
                path: '$totalCount',
                preserveNullAndEmptyArrays: true
            }
        }
    ]
    const list = await OrderSchema.aggregate(aggregation)
    const totalCount = list && list[0] && list[0].totalCount ? list[0].totalCount.count : 0
    const pagination = paginationData(totalCount, limit, offset)
    return res.status(statusCode.success).json(createSuccessResponse(messages.ordersFetch, {
        list: list[0].data,
        pagination
    }))
}

export const orderDetails = async (req, res) => {
    let details = await OrderSchema.findOne({ _id: req.body.id, isDeleted: null })
        .select('orderId cart user promo status totalPrice createdAt shiprocket')
        .populate({ path: 'promo', select: 'code type discount user' })
        .populate({ path: 'user', select: 'name email address profile' })
    if (details) return res.status(statusCode.success).json(createSuccessResponse(messages.ordersFetch, details))
    else return res.status(statusCode.error).json(createErrorResponse(messages.orderNotFound))
}

export const orderDelete = async (req, res) => {
    let details = await OrderSchema.findOne({ _id: req.body.id, isDeleted: null })
    if (details) {
        details['isDeleted'] = new Date();
        await details.save();
        if (details?.shiprocket?.orderId) cancelOrder(details.shiprocket.orderId).then().catch()
        return res.status(statusCode.success).json(createSuccessResponse(messages.ordersDelete))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.orderNotFound))
}

export const orderStatus = async (req, res) => {
    const { id, status } = req.body;
    let details = await OrderSchema.findOne({ _id: id, isDeleted: null });
    if (details) {
        details['status'] = status
        await details.save();
        return res.status(statusCode.success).json(createSuccessResponse(messages.orderStatus))
    }
    else return res.status(statusCode.error).json(createErrorResponse(messages.orderNotFound))
}

export const contentView = async (req, res) => {
    let details = await ContentSchema.findOne({}).select('privacy term');
    if (details) return res.status(statusCode.success).json(createSuccessResponse(messages.contentFetch, details))
    else return res.status(statusCode.error).json(createErrorResponse(messages.contentNotFound))
}

export const contentEdit = async (req, res) => {
    const { privacy, term } = req.body;
    let details = await ContentSchema.findOne({});
    if (details) {
        details['privacy'] = privacy
        details['term'] = term
        await details.save();
        return res.status(statusCode.success).json(createSuccessResponse(messages.contentUpdate))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.contentNotFound))
}

export const faqAdd = async (req, res) => {
    const { question, answer } = req.body;
    await new FaqSchema({ question, answer }).save();
    return res.status(statusCode.success).json(createSuccessResponse(messages.faqAdd))
}

export const faqDetails = async (req, res) => {
    const { id } = req.body;
    let details = await FaqSchema.findOne({ _id: id }).select('question answer');
    if (details) return res.status(statusCode.success).json(createSuccessResponse(messages.faqFetch, details))
    else return res.status(statusCode.error).json(createErrorResponse(messages.faqNotFound))
}

export const faqList = async (req, res) => {
    let { offset, limit, sort, order, search } = req.body;
    offset = offset ? offset : 0
    limit = limit ? limit : 10

    const aggregation = [
        {
            $project: {
                question: 1,
                answer: 1,
                createdAt: 1
            }
        },
        ...(search && search !== '' ? [{
            $match: {
                $or: [
                    { question: { $regex: search, $options: 'i' } },
                    { answer: { $regex: search, $options: 'i' } }
                ]
            }
        }] : []),
        {
            $facet: {
                data: [
                    { $sort: { [sort ? sort : 'createdAt']: order ? order : -1 } },
                    { $skip: offset },
                    { $limit: limit }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        },
        {
            $unwind: {
                path: '$totalCount',
                preserveNullAndEmptyArrays: true
            }
        }
    ]
    const list = await FaqSchema.aggregate(aggregation)
    const totalCount = list && list[0] && list[0].totalCount ? list[0].totalCount.count : 0
    const pagination = paginationData(totalCount, limit, offset)
    return res.status(statusCode.success).json(createSuccessResponse(messages.faqFetch, {
        list: list[0].data,
        pagination
    }))
}

export const faqRemove = async (req, res) => {
    const { id } = req.body;
    let details = await FaqSchema.findOne({ _id: id });
    if (details) {
        await details.deleteOne();
        return res.status(statusCode.success).json(createSuccessResponse(messages.faqRemove))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.faqNotFound))
}

export const faqUpdate = async (req, res) => {
    const { id, answer, question } = req.body;
    let details = await FaqSchema.findOne({ _id: id });
    if (details) {
        details['answer'] = answer
        details['question'] = question
        await details.save();
        return res.status(statusCode.success).json(createSuccessResponse(messages.faqUpdate))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.faqNotFound))
}

export const discountView = async (req, res) => {
    let details = await DiscountSchema.findOne({}).select('freeDeliveryPrice shippingCharge framePrice siteOfferPrice siteOfferDiscount');
    if (details) return res.status(statusCode.success).json(createSuccessResponse(messages.discountFetch, details))
    else return res.status(statusCode.error).json(createErrorResponse(messages.discountNotFound))
}

export const discountEdit = async (req, res) => {
    const { freeDeliveryPrice, shippingCharge, framePrice, siteOfferPrice, siteOfferDiscount } = req.body;
    let details = await DiscountSchema.findOne({});
    if (details) {
        details['freeDeliveryPrice'] = freeDeliveryPrice
        details['shippingCharge'] = shippingCharge
        details['framePrice'] = framePrice
        details['siteOfferPrice'] = siteOfferPrice
        details['siteOfferDiscount'] = siteOfferDiscount
        await details.save();
        return res.status(statusCode.success).json(createSuccessResponse(messages.discountUpdate))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.discountNotFound))
}

export const homepageView = async (req, res) => {
    let details = await HomepageSchema.findOne({}).select('firstContent secondContent instragram twitter facebook pinterest youTube');
    if (details) return res.status(statusCode.success).json(createSuccessResponse(messages.homepageFetch, details))
    else return res.status(statusCode.error).json(createErrorResponse(messages.homepageNotFound))
}

export const homepageEdit = async (req, res) => {
    const { firstContent, secondContent, instragram, twitter, facebook, pinterest, youTube } = req.body;
    let details = await HomepageSchema.findOne({});
    if (details) {
        details['firstContent'] = firstContent
        details['secondContent'] = secondContent
        details['instragram'] = instragram
        details['twitter'] = twitter
        details['facebook'] = facebook
        details['pinterest'] = pinterest
        details['youTube'] = youTube
        await details.save();
        return res.status(statusCode.success).json(createSuccessResponse(messages.homepageUpdate))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.homepageNotFound))
}

export const testimonialAdd = async (req, res) => {
    const { media, text } = req.body;
    await new TestimonialSchema({ media, text }).save();
    return res.status(statusCode.success).json(createSuccessResponse(messages.testimonialAdd))
}

export const testimonialDetails = async (req, res) => {
    const { id } = req.body;
    let details = await TestimonialSchema.findOne({ _id: id }).select('text media createdAt');
    if (details) return res.status(statusCode.success).json(createSuccessResponse(messages.testimonialFetch, details))
    else return res.status(statusCode.error).json(createErrorResponse(messages.testimonialNotFound))
}

export const testimonialList = async (req, res) => {
    let { offset, limit, sort, order, search } = req.body;
    offset = offset ? offset : 0
    limit = limit ? limit : 10

    const aggregation = [
        {
            $project: {
                media: 1,
                text: 1,
                createdAt: 1
            }
        },
        ...(search && search !== '' ? [{
            $match: {
                $or: [
                    { text: { $regex: search, $options: 'i' } },
                ]
            }
        }] : []),
        {
            $facet: {
                data: [
                    { $sort: { [sort ? sort : 'createdAt']: order ? order : -1 } },
                    { $skip: offset },
                    { $limit: limit }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        },
        {
            $unwind: {
                path: '$totalCount',
                preserveNullAndEmptyArrays: true
            }
        }
    ]
    const list = await TestimonialSchema.aggregate(aggregation)
    const totalCount = list && list[0] && list[0].totalCount ? list[0].totalCount.count : 0
    const pagination = paginationData(totalCount, limit, offset)
    return res.status(statusCode.success).json(createSuccessResponse(messages.testimonialFetch, {
        list: list[0].data,
        pagination
    }))
}

export const testimonialRemove = async (req, res) => {
    const { id } = req.body;
    let details = await TestimonialSchema.findOne({ _id: id });
    if (details) {
        await details.deleteOne();
        return res.status(statusCode.success).json(createSuccessResponse(messages.testimonialRemove))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.testimonialNotFound))
}

export const testimonialUpdate = async (req, res) => {
    const { id, media, text } = req.body;
    let details = await TestimonialSchema.findOne({ _id: id });
    if (details) {
        details['media'] = media
        details['text'] = text
        await details.save();
        return res.status(statusCode.success).json(createSuccessResponse(messages.testimonialUpdate))
    } else return res.status(statusCode.error).json(createErrorResponse(messages.testimonialNotFound))
}