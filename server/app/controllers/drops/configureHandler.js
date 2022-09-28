const DropHandler = require('../dropHandler')

const configureHandler = async (req, res) => {
  try {
    const dropHandler = await DropHandler.getInstance()

    if (req.body.interval) {
      dropHandler._interval = req.body.interval
    }

    if (req.body.interval) {
      dropHandler._interval = req.body.interval
    }

    if (req.body.enabled === true) {
      dropHandler.enableDrops()
    }

    if (req.body.enabled === false) {
      dropHandler.disableDrops()
    }

    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
    console.log('Failed to get DropHandler', err)
  }
}

module.exports = { configureHandler }
