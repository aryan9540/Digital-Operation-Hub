// ========================================
// API RESPONSE HELPER
// Standardized JSON response formatting
// ========================================

const sendSuccess = (res, statusCode = 200, message = "Success", data = null, meta = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    if (typeof data === "object" && !Array.isArray(data) && data !== null) {
      Object.assign(response, data);
    } else {
      response.data = data;
    }
  }

  if (meta !== null) {
    response.pagination = meta;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 500, message = "Server error", errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const sendPaginated = (
  res,
  statusCode = 200,
  message = "Success",
  dataKey = "data",
  items = [],
  page = 1,
  limit = 10,
  total = 0
) => {
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const totalPages = Math.ceil(total / pageLimit) || 0;

  return res.status(statusCode).json({
    success: true,
    message,
    count: items.length,
    [dataKey]: items,
    pagination: {
      total,
      totalCount: total,
      page: pageNumber,
      limit: pageLimit,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    },
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
};
