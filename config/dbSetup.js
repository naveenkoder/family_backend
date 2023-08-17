//schema
import mongoose from 'mongoose';
import { hashPassword } from '../helpers/utils.js';
import { AdminSchema } from '../models/admin.model.js';
import { ContentSchema } from '../models/content.model.js';
import { DiscountSchema } from '../models/discount.model.js';
import { HomepageSchema } from '../models/homepage.model.js';
import { PromoOfferSchema } from '../models/promoOffer.model.js';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;



const customSeed = async () => {
    AdminSchema.findOne({})
        .then(async (admin) => {
            if (!admin) {
                const password = await hashPassword(ADMIN_PASSWORD)
                new AdminSchema({ email: ADMIN_EMAIL, password }).save()
                    .then(suc => console.log('Admin launched'))
                    .catch(err => console.log('Error creating Admin',err))
            }
        }).catch(err => console.log('Error creating Admin',err))

    ContentSchema.findOne({})
        .then(async (content) => {
            if (!content) {
                new ContentSchema({ privacy: 'This is privacy policy.', term: 'This is terms & conditions.' }).save()
                    .then(suc => console.log('Content launched'))
                    .catch(err => console.log('Error creating content'))
            }
        }).catch(err => console.log('Error creating content'))

    DiscountSchema.findOne({})
        .then(async (discount) => {
            if (!discount) {
                new DiscountSchema({
                    freeDeliveryPrice: 1000,
                    shippingCharge: 50,
                    framePrice: 279,
                    siteOfferPrice: 5000,
                    siteOfferDiscount: 10
                }).save()
                    .then(suc => console.log('Discount launched'))
                    .catch(err => console.log('Error creating discount'))
            }
        }).catch(err => console.log('Error creating discount'))

    HomepageSchema.findOne({})
        .then(async (homepage) => {
            if (!homepage) {
                new HomepageSchema({
                    firstContent: {
                        links: ['https://www.youtube.com/embed/aL9WGMUu6Ns', 'https://www.youtube.com/embed/aL9WGMUu6Ns', 'https://www.youtube.com/embed/aL9WGMUu6Ns', 'https://www.youtube.com/embed/aL9WGMUu6Ns'],
                        title: 'Design beautiful walls filled with memories.',
                        description: 'Lorem imp sum lorem imp sum lorem imp sum Lorem imp sum lore loremm imp sum lorem imp sum lorem imp sum imp sum lorem imp sum lorem imp sum lorem imp lorem imp sum lorem imp sum lorem imp sum lorem imp sum lorem imp.',
                    },
                    secondContent: {
                        links: [],
                        title: 'Lorem imp sum lorem imp sum imp sum Lorem imp sum lorem imp sum imp sum',
                        description: 'Wonderful way to transform your walls',
                    },
                    instragram: 'https://www.instagram.com/familyvibes.in/',
                    twitter: 'https://twitter.com/login',
                    facebook: 'https://www.facebook.com',
                    youTube: 'https://www.youtube.com/',
                    pinterest: 'https://in.pinterest.com/'
                }).save()
                    .then(suc => console.log('Homepage launched'))
                    .catch(err => console.log('Error creating homepage'))
            }
        }).catch(err => console.log('Error creating homepage'))

    PromoOfferSchema.find({})
        .then(async (promoOffer) => {
            if (promoOffer.length === 0) {
                PromoOfferSchema.insertMany([
                    {
                        noOfFrames: 4,
                        discount: 1100
                    },
                    {
                        noOfFrames: 8,
                        discount: 2100
                    },
                    {
                        noOfFrames: 12,
                        discount: 3100
                    },
                    {
                        noOfFrames: 16,
                        discount: 4100
                    },
                    {
                        noOfFrames: 20,
                        discount: 5000
                    }
                ])
                    .then(suc => console.log('Promo offer launched'))
                    .catch(err => console.log('Error creating promo offer'))
            }
        }).catch(err => console.log('Error creating promo offer'))
}

const MONGO_CONNECT_URL = process.env.MONGO_CONNECTION_URL

const mongoDBOptions = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
}

await mongoose.connect(MONGO_CONNECT_URL, mongoDBOptions, (err) => {
    if (err) console.log(`Cannot connect to ${MONGO_CONNECT_URL}`, err)
    else {
        console.log(` connect to ${MONGO_CONNECT_URL}`)
        customSeed();
    }
});

