const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace request data with validated data to strip extra/unwanted fields (Mass Assignment Protection)
    req.body = parsed.body;
    req.query = parsed.query;
    req.params = parsed.params;

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
