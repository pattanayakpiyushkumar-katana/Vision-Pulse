export const errorHandler = (err, req, res, next) => {
  console.error('[Backend Error Handler]', err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload Too Large',
      details: 'Visual asset exceeds maximum allowable size (12MB).'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal backend server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { devDetails: err.stack })
  });
};

