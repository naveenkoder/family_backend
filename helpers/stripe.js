import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export const doPayment = (payment, token, description, orderId) => {
    const options = {
        amount: payment * 100,
        currency: "INR",
        source: token,
        description,
        metadata: {
            orderId
        }
    };
    return stripe.charges.create(options)
}