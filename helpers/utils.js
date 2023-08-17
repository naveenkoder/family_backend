import mongoose from 'mongoose';
import JWT from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import moment from 'moment';

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = payload => JWT.sign(payload, JWT_SECRET);

const verifyToken = token => {
    try {
        return JWT.verify(token, JWT_SECRET)
    } catch (error) {
        return false;
    }
};

const escapeSpecialCharacter = (text) => {
    if (text) return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    else return '';
}

const hashPassword = async password => await bcrypt.hash(password, 6);

const comparePassword = async (password1, password2) => await bcrypt.compare(password1, password2);

const isPhoto = mimetype => mimetype && mimetype == 'image/jpeg' || mimetype == 'image/jpg' || mimetype == 'image/png' || mimetype == 'image/gif';

const isVideo = mimetype => {
    if (!mimetype) return false;
    switch (mimetype) {
        case 'video/mp4':
        case 'video/quicktime':
        case 'video/mpeg':
        case 'video/mp2t':
        case 'video/webm':
        case 'video/ogg':
        case 'video/x-ms-wmv':
        case 'video/x-msvideo':
        case 'video/3gpp':
        case 'video/3gpp2':
            return true;
        default:
            return false;
    }
}

const paginationData = (totalCount, LIMIT, OFFSET) => {
    let totalPages = Math.ceil(totalCount / LIMIT);
    let currentPage = Math.floor(OFFSET / LIMIT);
    let prevPage = (currentPage - 1) > 0 ? (currentPage - 1) * LIMIT : 0;
    let nextPage = (currentPage + 1) <= totalPages ? (currentPage + 1) * LIMIT : 0;

    return {
        totalCount,
        nextPage,
        prevPage,
        totalCount,
        currentPage: currentPage + 1
    }
}

const createSuccessResponse = (message, data = null, success = true) => {
    return { success, message, data };
}

const createErrorResponse = (message, data = null, success = false) => {
    return { success, message, data };
}

const parseToMongoObjectID = string => mongoose.Types.ObjectId(string);

const uuidv4_10 = () => {
    let dt = new Date().getTime();
    return 'xxxyxxyxxyxx'.replace(/[xy]/g, c => {
        let r = (dt + Math.random() * 16) % 16 | 0;
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase();
    });
}

const generateOrderId = () => {
    let dt = new Date().getTime();
    return 'xxxyxxyxxy'.replace(/[xy]/g, c => {
        let r = (dt + Math.random() * 16) % 16 | 0;
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase();
    });
}

const generatePromoCode = () => {
    let dt = new Date().getTime();
    return 'yxxyxy'.replace(/[xy]/g, c => {
        let r = (dt + Math.random() * 16) % 16 | 0;
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase();
    });
}

const imageExtension = ['jpg', 'png', 'jpeg']
const videoExtension = ['mp4', 'mkv', 'avi']
const fileExtension = ['.jpg', '.png', '.jpeg', '.mp4', '.mkv', '.avi']

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

const generateOtp = () => Math.floor(1000 + Math.random() * 9000);

export {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    isPhoto,
    isVideo,
    paginationData,
    createSuccessResponse,
    createErrorResponse,
    parseToMongoObjectID,
    uuidv4_10,
    imageExtension,
    videoExtension,
    fileExtension,
    isObjectId,
    escapeSpecialCharacter,
    generateOrderId,
    generatePromoCode,
    generateOtp
}