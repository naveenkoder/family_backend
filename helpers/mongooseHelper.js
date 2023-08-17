import { DiscountSchema } from '../models/discount.model.js';

export const calculateGrandTotal = async (products, promoOffer) => {
    const discountDetails = await DiscountSchema.findOne({});
    const promoDiscount = promoOffer?.discount ? promoOffer?.discount : 0;
    if (discountDetails) {
        const { freeDeliveryPrice, shippingCharge, framePrice, siteOfferPrice, siteOfferDiscount } = discountDetails;
        const actualCost = (products.length * framePrice) > siteOfferPrice ? (framePrice * products.length) - (framePrice * products.length * (siteOfferDiscount) / 100) : products.length * framePrice;
        const isShippingFree = actualCost > freeDeliveryPrice;
        const cost = isShippingFree ? actualCost : actualCost + shippingCharge
        const totalCost = cost >= promoDiscount ? cost - promoDiscount : 0;
        return {
            framePrice,
            promo: promoOffer ? promoOffer : null,
            isShippingFree,
            shippingCharges: isShippingFree ? 0 : shippingCharge,
            totalCost,
            isSiteOffer: (products.length * framePrice) > siteOfferPrice ? true : false,
            siteOfferDiscount
        }
    } else return false
}