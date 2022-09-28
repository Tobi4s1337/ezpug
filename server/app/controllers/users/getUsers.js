const User = require('../../models/user')
const { handleError } = require('../../middleware/utils')
const { getItems, checkQueryString } = require('../../middleware/db')

/**
 * Get items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const getUsers = async (req, res) => {
  try {
    const query = await checkQueryString(req.query)
    console.log(query)
    if (req.user.role === 'user') {
      req.query.select = 'name steamId status avatar steamUrl stats'
    }
    req.query.select = 'name steamId status avatar steamUrl stats'
    //req.query.select = 'name steamId stats status'
    res.status(200).json(await getItems(req, User, query))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getUsers }
