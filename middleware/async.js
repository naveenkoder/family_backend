import { createErrorResponse } from '../helpers/utils.js';
import fs from 'fs';

function asyncTryCatchMiddleware(handler) {
  return async (req, res, next) => {
    if (req.fileError) {
      if (req.file && req.file.path) fs.unlinkSync(req.file.path)
      return res.status(400).json(createErrorResponse(req.fileError, null, 1000))
    }
    try { await handler(req, res) }
    catch (err) {
      next(err)
    }
  }
}

export default asyncTryCatchMiddleware;