import { messages } from '../constant/message.js';
import { statusCode } from '../constant/statusCode.js';
import { verifyToken, createErrorResponse } from '../helpers/utils.js'
import { UserSchema } from '../models/user.model.js';
import { AdminSchema } from '../models/admin.model.js';

const verifyUserJWTToken = async (req, res, next) => {
    let token = req.headers?.['x-access-token'] || req.headers?.['authorization']
    if (token) {
        token = token.split('Bearer ')?.[1];
        if (token) {
            const verifyDetails = verifyToken(token)
            const { _id, socialId, deviceType, deviceToken, type } = verifyDetails;
            if (type === "user") {
                const userDetails = await UserSchema.findOne({ _id }, '');
                if (userDetails) {
                    if (userDetails.deviceToken != deviceToken) return res.status(statusCode.unauthorized).json(createErrorResponse(messages.loginOnAnotherDevice, null))
                    else if (userDetails.isBlock) return res.status(statusCode.unauthorized).json(createErrorResponse(messages.blockByAdmin, null))
                    else {
                        req["user"] = userDetails
                        next()
                    }
                } else return res.status(statusCode.unauthorized).json(createErrorResponse(messages.userNotFound, null))
            } else if (type === "admin") {
                const adminDetails = await AdminSchema.findOne({ _id }, '');
                if (adminDetails) {
                    if (adminDetails.deviceToken != deviceToken) return res.status(statusCode.unauthorized).json(createErrorResponse(messages.loginOnAnotherDevice, null))
                    else {
                        req["user"] = adminDetails
                        next()
                    }
                } else return res.status(statusCode.unauthorized).json(createErrorResponse(messages.userNotFound, null))
            } else return res.status(statusCode.unauthorized).json(createErrorResponse(messages.tokenRequired, null))
        } else return res.status(statusCode.unauthorized).json(createErrorResponse(messages.tokenRequired, null))
    } else return res.status(statusCode.unauthorized).json(createErrorResponse(messages.tokenRequired, null))
}

const verifyAdminJWTToken = async (req, res, next) => {
    let token = req.headers?.['authorization']
    if (token) {
        token = token.split('Bearer ')?.[1];
        if (token) {
            const verifyDetails = verifyToken(token)
            const { _id, deviceType, deviceToken, password } = verifyDetails;
            const adminDetails = await AdminSchema.findOne({ _id }, '');
            if (adminDetails) {
                if (adminDetails.deviceToken != deviceToken) return res.status(statusCode.unauthorized).json(createErrorResponse(messages.loginOnAnotherDevice, null))
                else if (adminDetails.password != password) return res.status(statusCode.unauthorized).json(createErrorResponse(messages.passwordHasUpdated, null))
                else {
                    req["user"] = adminDetails
                    next()
                }
            } else return res.status(statusCode.unauthorized).json(createErrorResponse(messages.userNotFound, null))
        } else return res.status(statusCode.unauthorized).json(createErrorResponse(messages.tokenRequired, null))
    } else return res.status(statusCode.unauthorized).json(createErrorResponse(messages.tokenRequired, null))
}

export { verifyUserJWTToken, verifyAdminJWTToken };