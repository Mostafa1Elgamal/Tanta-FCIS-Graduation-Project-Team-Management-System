const mongoSanitize = require('express-mongo-sanitize');

const validate = (schema) => (req, res, next) => {
  try {
    // 1) Sanitize all inputs to prevent NoSQL Injection
    mongoSanitize.sanitize(req.body);
    mongoSanitize.sanitize(req.query);
    mongoSanitize.sanitize(req.params);

    // 2) Validate with Zod
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // 3) Replace req.body with validated data (Mass Assignment Protection)
    req.body = parsed.body;
    
    next();
  } catch (err) {
    const firstError = err.errors[0];
    const message = `${firstError.path[1] || firstError.path[0]}: ${firstError.message}`;

    return res.status(400).json({
      status: 'error',
      message: message,
      errors: err.errors.map((e) => ({
        field: e.path[1] || e.path[0],
        message: e.message,
      })),
    });
  }
};

module.exports = validate;
