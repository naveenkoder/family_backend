import express from "express";
const router = express.Router();

import { router as userRoute } from './userRoute/index.js'
import { router as adminRoute } from './adminRoute/index.js'


router.use('/user', userRoute)
router.use('/admin', adminRoute)

export default router;