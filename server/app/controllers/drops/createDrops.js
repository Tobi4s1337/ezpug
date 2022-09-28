const Drop = require('../../models/drop')
const { createItem } = require('../../middleware/db')
const { handleError } = require('../../middleware/utils')

/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const createDrops = async (req, res) => {
  try {
    if (req.body.name && req.body.image) {
      const sound = req.body.sound ? req.body.sound : 'ui\\item_drop3_rare'

      for (let i = 0; i < req.body.amount; i++) {
        await createItem(
          {
            sound,
            name: req.body.name,
            image: req.body.image
          },
          Drop
        )
      }
      res.sendStatus(201)
    } else {
      res.sendStatus(403)
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { createDrops }
