import './config/envirnoment.js';
import http from 'http';
import express from "express";
import mongoose from 'mongoose';
import { createErrorResponse, escapeSpecialCharacter } from './helpers/utils.js';
import router from './routers/v1/index.js'
import cors from 'cors';
import admin from 'firebase-admin';
import { service } from './integration/firebase.js';
import { statusCode } from './constant/statusCode.js';
import { scheduleCron } from './helpers/cron.js';
import { createAuth } from './helpers/shipment.js';

const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
createAuth();
scheduleCron();

admin.initializeApp({
    credential: admin.credential.cert(service),
    storageBucket: "gs://ecommerce-5769b.appspot.com"
});
export const bucket = admin.storage().bucket();






import './config/dbSetup.js';

app.use('/public', express.static('public'))
app.use((req, res, next) => {
    if (req.body.offset && req.body.offset != '') req.body.offset = parseInt(req.body.offset)
    if (req.body.limit && req.body.limit != '') req.body.limit = parseInt(req.body.limit)
    if (req.body.search && req.body.search != '') req.body.search = escapeSpecialCharacter(req.body.search)

    next()
})

const server = http.createServer(app);

app.use('/v1/api/', router)
app.use((err, req, res, next) => {
    if (err) {
        return res.status(statusCode.error).send(createErrorResponse(err?.message))
    } else next();
})
app.use((req, res, next) => res.send('Family Vibes Server is running'));

server.listen(PORT, () => {
    console.log(`Server is listing on PORT ${PORT}`)
})