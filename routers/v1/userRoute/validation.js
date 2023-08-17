import yup from 'yup';
import { messages } from '../../../constant/message.js';
import { deviceTypeEnum, socialTypeEnum } from '../../../models/common/commonTypes.js';
const mailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const socialValidation = yup.object({
    body: yup.object({
        deviceToken: yup.string().required(),
        deviceType: yup.mixed().oneOf(Object.values(deviceTypeEnum)).required(),
        loginType: yup.mixed().oneOf(Object.values(socialTypeEnum)).required(),
        data: yup.object({
            id: yup.string().required(),
            email: yup.string().required(),
            name: yup.string().optional().nullable(),
            picture: yup.string().optional().nullable(),
        })
    })
});


export const idValidation = yup.object({
    body: yup.object({
        id: yup.string().matches(/^[0-9a-zA-Z]{24}$/, messages.validObjectId).required()
    })
});

export const orderCheckValidation = yup.object({
    body: yup.object({
        products: yup.array().of(
            yup.object({
                frame: yup.string().required(),
                picture: yup.string().required(),
                quantity: yup.number().required()
            })
        ).required(),
        promo: yup.string().optional().nullable()
    })
});

export const orderValidation = yup.object({
    body: yup.object({
        products: yup.array().of(
            yup.object({
                frame: yup.string().required(),
                picture: yup.string().required(),
                quantity: yup.number().required()
            })
        ).required(),
        promo: yup.string().optional().nullable(),
        token: yup.string().required()
    })
});

export const orderListValidation = yup.object({
    body: yup.object({
        offset: yup.number().optional().nullable(),
        limit: yup.number().optional().nullable(),
    })
});

export const addAddressValidation = yup.object({
    body: yup.object({
        email: yup.string().required(),
        name: yup.string().required(),
        country: yup.string().required(),
        street: yup.string().required(),
        phone: yup.string().required(),
        lastName: yup.string().required(),
        city: yup.string().required(),
        pincode: yup.string().required(),
        state: yup.string().required(),
    })
});

export const promoValidValidation = yup.object({
    body: yup.object({
        promo: yup.string().required()
    })
});

export const sendOtpValidation = yup.object({
    body: yup.object({
        phone: yup.string().required(),
    })
});

export const verifyOtpValidation = yup.object({
    body: yup.object({
        otp: yup.string().required()
    })
});

export const contactValidation = yup.object({
    body: yup.object({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        phone: yup.string().required(),
        email: yup.string().required(),
        message: yup.string().required()
    })
});

export const buyPromoValidation = yup.object({
    body: yup.object({
        id: yup.string().matches(/^[0-9a-zA-Z]{24}$/, messages.validObjectId).required(),
        token: yup.string().required()
    })
});
