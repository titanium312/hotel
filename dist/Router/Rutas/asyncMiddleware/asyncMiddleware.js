"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Definición del middleware asíncrono para manejar errores de manera centralizada
const asyncMiddleware = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.default = asyncMiddleware;
