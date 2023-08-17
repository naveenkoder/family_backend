import express from "express";
const router = express.Router();

import asyncTryCatchMiddleware from '../../../middleware/async.js';
import { verifyAdminJWTToken } from '../../../middleware/auth.js';
import validator from '../../../middleware/validator.js';

import * as validationSchema from './validation.js';

import * as AdminController from '../../../controller/v1/admin.controller.js'

router.post('/login', validator(validationSchema.loginValidation), asyncTryCatchMiddleware(AdminController.login))
router.post('/forgot', validator(validationSchema.forgotValidation), asyncTryCatchMiddleware(AdminController.forgotPassword))
router.post('/link-status', validator(validationSchema.linkStatusValidation), asyncTryCatchMiddleware(AdminController.resetPasswordLink))
router.post('/reset-password', validator(validationSchema.resetPasswordValidation), asyncTryCatchMiddleware(AdminController.resetPassword))
router.post('/update-password', validator(validationSchema.updatePasswordValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.changePassword))
router.get('/dashboard', verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.dashboard))

router.post('/user/list', validator(validationSchema.listValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.usersList))
router.post('/user/details', validator(validationSchema.idValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.userDetails))
router.put('/user/edit', validator(validationSchema.editValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.editUserProfile))
router.post('/user/block', validator(validationSchema.idValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.blockUnblockUser))

router.post('/order/list', validator(validationSchema.listValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.ordersList))
router.post('/order/details', validator(validationSchema.idValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.orderDetails))
router.post('/order/status', validator(validationSchema.orderStatusValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.orderStatus))
router.post('/order/delete', validator(validationSchema.idValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.orderDelete))

router.get('/content/details', verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.contentView))
router.put('/content/edit', validator(validationSchema.contentUpdateValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.contentEdit))

router.post('/faq/add', validator(validationSchema.faqAddValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.faqAdd))
router.post('/faq/details', validator(validationSchema.idValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.faqDetails))
router.delete('/faq/delete', validator(validationSchema.idValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.faqRemove))
router.post('/faq/list', validator(validationSchema.listValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.faqList))
router.put('/faq/edit', validator(validationSchema.faqEditValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.faqUpdate))

router.get('/discount/details', verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.discountView))
router.put('/discount/edit', validator(validationSchema.discountEditValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.discountEdit))

router.get('/homepage/details', verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.homepageView))
router.put('/homepage/edit', validator(validationSchema.homepageEditValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.homepageEdit))

router.post('/testimonial/add', validator(validationSchema.testimonialAddValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.testimonialAdd))
router.post('/testimonial/details', validator(validationSchema.idValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.testimonialDetails))
router.delete('/testimonial/delete', validator(validationSchema.idValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.testimonialRemove))
router.post('/testimonial/list', validator(validationSchema.listValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.testimonialList))
router.put('/testimonial/edit', validator(validationSchema.testimonialEditValidation), verifyAdminJWTToken, asyncTryCatchMiddleware(AdminController.testimonialUpdate))

export {
    router
};