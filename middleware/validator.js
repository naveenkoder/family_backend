import { payloadLogger } from "../config/logger.js";
import { statusCode } from "../constant/statusCode.js";
import { createErrorResponse } from "../helpers/utils.js";

const validator = (schema) => async (req, res, next) => {
  try {
    payloadLogger.info('logs', { host: req.headers.host, ip: req.ip, url: req.originalUrl, method: req.method, params: req.params, query: req.query, body: req.body })
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    })
    return next();
  } catch (err) {
    return res.status(statusCode.error).send(createErrorResponse(err?.message));
  }
};

export default validator;