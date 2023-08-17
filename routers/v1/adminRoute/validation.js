import yup from 'yup';
import { messages } from '../../../constant/message.js';
import { orderStatusEnum, socialTypeEnum } from '../../../models/common/commonTypes.js';

export const loginValidation = yup.object({
    body: yup.object({
        email: yup.string().required(),
        password: yup.string().required()
    })
});

export const forgotValidation = yup.object({
    body: yup.object({
        email: yup.string().required()
    })
});

export const linkStatusValidation = yup.object({
    body: yup.object({
        token: yup.string().required()
    })
});

export const resetPasswordValidation = yup.object({
    body: yup.object({
        token: yup.string().required(),
        password: yup.string().required()
    })
});

export const updatePasswordValidation = yup.object({
    body: yup.object({
        oldPassword: yup.string().required(),
        password: yup.string().required()
    })
});

export const listValidation = yup.object({
    body: yup.object({
        offset: yup.number().optional().nullable(),
        limit: yup.number().optional().nullable(),
        sort: yup.string().optional().nullable(),
        order: yup.number().optional().nullable(),
        search: yup.string().optional().nullable()
    })
});

export const idValidation = yup.object({
    body: yup.object({
        id: yup.string().matches(/^[0-9a-zA-Z]{24}$/, messages.validObjectId).required()
    })
});

export const editValidation = yup.object({
    body: yup.object({
        id: yup.string().matches(/^[0-9a-zA-Z]{24}$/, messages.validObjectId),
        name: yup.string().optional().nullable(),
    })
});

export const orderStatusValidation = yup.object({
    body: yup.object({
        id: yup.string().matches(/^[0-9a-zA-Z]{24}$/, messages.validObjectId).required(),
        status: yup.mixed().oneOf(Object.keys(orderStatusEnum)).required()
    })
});

export const contentUpdateValidation = yup.object({
    body: yup.object({
        privacy: yup.string().required(),
        term: yup.string().required()
    })
});

export const faqAddValidation = yup.object({
    body: yup.object({
        question: yup.string().required(),
        answer: yup.string().required()
    })
});

export const faqEditValidation = yup.object({
    body: yup.object({
        id: yup.string().matches(/^[0-9a-zA-Z]{24}$/, messages.validObjectId).required(),
        question: yup.string().required(),
        answer: yup.string().required()
    })
});

export const discountEditValidation = yup.object({
    body: yup.object({
        freeDeliveryPrice: yup.number().required(),
        shippingCharge: yup.number().required(),
        framePrice: yup.number().required(),
        siteOfferPrice: yup.number().required(),
        siteOfferDiscount: yup.number().required()
    })
});

export const homepageEditValidation = yup.object({
    body: yup.object({
        firstContent: yup.object({
            links: yup.array().of(yup.string()).required(),
            title: yup.string().required(),
            description: yup.string().required(),
        }).required(),
        secondContent: yup.object({
            links: yup.array().of(yup.string()).required(),
            title: yup.string().required(),
            description: yup.string().required(),
        }).required(),
        instragram: yup.string().url().required(),
        twitter: yup.string().url().required(),
        facebook: yup.string().url().required(),
        youTube: yup.string().url().required(),
        pinterest: yup.string().url().required()
    })
});

export const testimonialAddValidation = yup.object({
    body: yup.object({
        media: yup.string().url().required(),
        text: yup.string().required()
    })
});

export const testimonialEditValidation = yup.object({
    body: yup.object({
        id: yup.string().matches(/^[0-9a-zA-Z]{24}$/, messages.validObjectId).required(),
        media: yup.string().url().required(),
        text: yup.string().required()
    })
});
