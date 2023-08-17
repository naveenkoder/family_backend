import multer from 'multer';

export const uploadMedia = multer({
    storage: multer.memoryStorage({})
})