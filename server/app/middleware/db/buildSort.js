/**
 * Builds sorting
 * @param {string} sort - field to sort from
 * @param {number} order - order for query (1,-1)
 */
const buildSort = (sort, order) => {
  const sortBy = {}
  sortBy[sort] = order
  console.log(sort)
  console.log(order)
  return sortBy
}

module.exports = { buildSort }
