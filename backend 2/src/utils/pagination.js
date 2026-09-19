function getPagination(query, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(maxLimit, Math.max(1, Number(query.limit || defaultLimit)));
  return { page, limit, offset: (page - 1) * limit };
}

module.exports = getPagination;
