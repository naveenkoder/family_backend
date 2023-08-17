import express from "express";
const router = express.Router();

import asyncTryCatchMiddleware from '../../../middleware/async.js';
import { verifyUserJWTToken } from '../../../middleware/auth.js';
import validator from '../../../middleware/validator.js';

import * as validationSchema from './validation.js';

import { uploadMedia } from '../../../helpers/multer.js';
const upload = uploadMedia.array('file', 10);

import * as UserController from '../../../controller/v1/user.controller.js'

router.post('/social-login', validator(validationSchema.socialValidation), asyncTryCatchMiddleware(UserController.signUpWithSocial))
router.get('/profile', verifyUserJWTToken, asyncTryCatchMiddleware(UserController.profile))
router.post('/upload', verifyUserJWTToken, upload, asyncTryCatchMiddleware(UserController.fileUpload))

router.post('/order/book', verifyUserJWTToken, validator(validationSchema.orderValidation), asyncTryCatchMiddleware(UserController.placeOrder))
router.post('/order/cost', verifyUserJWTToken, validator(validationSchema.orderCheckValidation), asyncTryCatchMiddleware(UserController.checkOrderPrice))
router.post('/order/list', verifyUserJWTToken, validator(validationSchema.orderListValidation), asyncTryCatchMiddleware(UserController.myOrders))

router.post('/otp/send', verifyUserJWTToken, validator(validationSchema.sendOtpValidation), asyncTryCatchMiddleware(UserController.sendOtp))
router.post('/otp/verify', verifyUserJWTToken, validator(validationSchema.verifyOtpValidation), asyncTryCatchMiddleware(UserController.verifyOtp))
router.get('/address/view', verifyUserJWTToken, asyncTryCatchMiddleware(UserController.viewAddress))
router.put('/address/edit', verifyUserJWTToken, validator(validationSchema.addAddressValidation), asyncTryCatchMiddleware(UserController.addAddress))

router.post('/promo/orderId', verifyUserJWTToken, validator(validationSchema.buyPromoValidation), asyncTryCatchMiddleware(UserController.getPromoOrderId))
router.post('/promo/valid', verifyUserJWTToken, validator(validationSchema.promoValidValidation), asyncTryCatchMiddleware(UserController.promoValidity))
router.get('/promo/list', asyncTryCatchMiddleware(UserController.promoList))

router.get('/website', asyncTryCatchMiddleware(UserController.getBasicInfo))
router.post('/contact', validator(validationSchema.contactValidation), asyncTryCatchMiddleware(UserController.contactUs))

export {
    router
};