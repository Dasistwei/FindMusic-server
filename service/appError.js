const appError = (httpStatus, errMessage) => {
  const error = new Error(errMessage);
  error.statusCode = httpStatus;
  error.isOperational = true;
  return error;
};

module.exports = appError;
