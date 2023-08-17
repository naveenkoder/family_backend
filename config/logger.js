import { createLogger, transports, config, format } from 'winston';
const { combine, timestamp, json } = format;

export const payloadLogger = createLogger({
    levels: config.syslog.levels,
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        json()
    ),
    transports: [
        new transports.File({
            filename: 'logs/payload/payload.log',
            maxsize: 100000000
        }),
    ]
})

export const shipmentLogger = createLogger({
    levels: config.syslog.levels,
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        json()
    ),
    transports: [
        new transports.File({
            filename: 'logs/shipment/shipment.log',
            maxsize: 100000000
        }),
    ]
})

export const orderLogger = createLogger({
    levels: config.syslog.levels,
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        json()
    ),
    transports: [
        new transports.File({
            filename: 'logs/order/order.log',
            maxsize: 100000000
        }),
    ]
})

export const invoiceLogger = createLogger({
    levels: config.syslog.levels,
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        json()
    ),
    transports: [
        new transports.File({
            filename: 'logs/invoice/invoice.log',
            maxsize: 100000000
        }),
    ]
})