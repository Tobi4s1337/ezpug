const User = require('../../models/user')
const { getProfileFromDB } = require('./helpers')
const { isIDGood, handleError } = require('../../middleware/utils')

const getRank = ({ userId }) => {
  return new Promise((resolve, reject) => {
    User.find({})
      .sort('stats.elo')
      .exec(async (err, users) => {
        if (err || !users) {
          return reject(err)
        }
        for (const [index, user] of users.entries()) {
          if (user._id.toString() === userId.toString()) {
            return resolve(index + 1)
          }
        }
      })
  })
}

/**
 * Get profile function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const getProfile = async (req, res) => {
  try {
    const id = await isIDGood(req.user._id)
    let profile = await getProfileFromDB(id)
    profile = profile.toObject()
    profile.rank = await getRank({ userId: req.user._id })
    res.status(200).json(profile)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getProfile }
