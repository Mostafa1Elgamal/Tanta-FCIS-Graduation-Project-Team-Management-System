const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
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
