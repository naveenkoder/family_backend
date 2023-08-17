import cron from 'node-cron';
import { createAuth } from './shipment.js';

export const scheduleCron = () => {
    cron.schedule('1 8 * * Sun', () => {
        createAuth();
    });
}
