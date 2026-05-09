const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace request body with validated data (Mass Assignment Protection)
    // We only overwrite req.body as req.query and req.params are often read-only getters in Express
    // req.body = parsed.body;
    
    // If you need to strip query/params, it's safer to do it in the controller or 
    // by individual key deletion if necessary.

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
