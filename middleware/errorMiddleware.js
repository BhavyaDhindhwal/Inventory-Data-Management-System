function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}
function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || "Internal server error";
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map(e => e.message).join(", ");
  }
  if (err.code === 11000) {
    status = 409;
    message = "SKU already exists. SKU must be unique.";
  }
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid product ID";
  }
  res.status(status).json({
    success: false, message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {})
  });
}
module.exports = { notFound, errorHandler };
