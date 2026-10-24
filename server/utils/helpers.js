const jwt = require('jsonwebtoken');

// Wrap async route handlers so errors reach the error middleware (Express 4)
exports.ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

exports.httpError = (status, message) => Object.assign(new Error(message), { status });

exports.round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

exports.signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
