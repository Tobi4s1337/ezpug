const DropHandler = require('../dropHandler')

const getHandler = async (req, res) => {
  try {
    const dropHandler = await DropHandler.getInstance()

    let info = {
      enabled: dropHandler._enabled,
      odds: dropHandler._odds,
      interval: dropHandler._interval
    }

    res.json(info)
  } catch (err) {
    res.sendStatus(500)
    console.log('Failed to get DropHandler', err)
  }
}

module.exports = { getHandler }
