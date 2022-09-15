const { buildErrObject } = require('../../middleware/utils')
const { buildSort } = require('./buildSort')

/**
 * Builds initial options for query
 * @param {Object} query - query object
 */
const listInitOptions = (req = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      let order = -1

      if (
        req.query.order &&
        req.query.order[0] &&
        req.query.order[0] !== 'false'
      ) {
        order = req.query.order
      }

      const sort = req.query.sort || 'createdAt'
      const sortBy = buildSort(sort, order)
      const page = parseInt(req.query.page, 10) || 1
      const limit = parseInt(req.query.limit, 10) || 5
      const select = req.query.select ? req.query.select : false
      const options = {
        sort: sortBy,
        lean: true,
        page,
        limit
      }
      if (select) {
        options.select
      }
      resolve(options)
    } catch (error) {
      console.log(error.message)
      reject(buildErrObject(422, 'ERROR_WITH_INIT_OPTIONS'))
    }
  })
}

module.exports = { listInitOptions }
