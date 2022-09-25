const MatchHandler = require('../../controllers/matchHandler')

const handleDathostMatchRequest = async (req, res) => {
  try {
    const matchHandler = await MatchHandler.getInstance()

    matchHandler.handleDathostMatchRequest(req.body)
    res.sendStatus(200)
  } catch (err) {
    console.log('Error in dathost requst', err)
    res.sendStatus(200)
  }
}

module.exports = { handleDathostMatchRequest }
