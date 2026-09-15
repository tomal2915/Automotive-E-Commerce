// Standardizes the paginated-response shape across EVERY endpoint that
// returns a list — same envelope everywhere: { items, pagination }.
// Prevents the drift we had before (some endpoints returning a bare
// array, others a differently-shaped pagination object).
export const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

export const parsePagination = (
  query,
  { defaultLimit = 20, maxLimit = 100 } = {},
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || defaultLimit, maxLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
