import axios from 'axios';
import { shipmentLogger } from '../config/logger.js';
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
global.shipRocketToken = '';

const loginApi = `https://apiv2.shiprocket.in/v1/external/auth/login`;
const createOrderApi = `https://apiv2.shiprocket.in/v1/external/orders/create/adhoc`;
const generateAwbApi = `https://apiv2.shiprocket.in/v1/external/courier/assign/awb`;
const cancelOrderApi = `https://apiv2.shiprocket.in/v1/external/orders/cancel`;

export const createAuth = () => {
    axios.post(loginApi, {
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD
    })
        .then(loginSuccess => {
            global.shipRocketToken = 'Bearer ' + loginSuccess.data?.token
        })
        .catch(error => {
            shipmentLogger.error('Error', { url: loginApi, error: error?.response?.data?.message })
        })
}

export const doShipment = async (orderData) => {
    return axios.post(createOrderApi, orderData, { headers: { Authorization: global.shipRocketToken } })
        .then(orderSuccess => {
            orderSuccess = orderSuccess.data;
            return axios.post(generateAwbApi, { shipment_id: orderSuccess?.shipment_id }, { headers: { Authorization: global.shipRocketToken } })
                .then(awbSuccess => {
                    awbSuccess = awbSuccess.data;
                    return { success: true, data: awbSuccess };
                })
                .catch(error => {
                    shipmentLogger.error('Error', { url: generateAwbApi, error: error?.response?.data?.message })
                    return { success: false, message: error?.response?.data?.message };
                })
        })
        .catch(error => {
            shipmentLogger.error('Error', { url: createOrderApi, error: error?.response?.data?.message })
            return { success: false, message: error?.response?.data?.message };
        })
}


export const cancelOrder = async (orderId) => {
    return axios.post(cancelOrderApi, { ids: [orderId] }, { headers: { Authorization: global.shipRocketToken } })
        .then(cancelSuccess => {
            cancelSuccess = cancelSuccess.data;
            return { success: true, data: cancelSuccess };
        })
        .catch(error => {
            shipmentLogger.error('Error', { url: cancelOrderApi, error: error?.response?.data?.message })
            return { success: false, message: error?.response?.data?.message };
        })
}