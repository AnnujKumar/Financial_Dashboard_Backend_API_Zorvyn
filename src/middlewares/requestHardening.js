const dangerousKeys = new Set(['__proto__', 'constructor', 'prototype']);

const hasSuspiciousContent = (value) => {
  if (value === null || value === undefined) return false;

  if (typeof value === 'string') {
    return value.includes('\u0000');
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasSuspiciousContent(item));
  }

  if (typeof value === 'object') {
    return Object.entries(value).some(([key, nested]) => {
      if (dangerousKeys.has(key) || key.startsWith('$')) return true;
      return hasSuspiciousContent(nested);
    });
  }

  return false;
};

const rejectSuspiciousInput = (req, res, next) => {
  if (hasSuspiciousContent(req.body) || hasSuspiciousContent(req.query) || hasSuspiciousContent(req.params)) {
    return res.status(400).json({ error: 'Suspicious input detected' });
  }

  return next();
};

module.exports = { rejectSuspiciousInput };
