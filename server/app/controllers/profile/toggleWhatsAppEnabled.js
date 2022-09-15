const { toggleWhatsAppEnabledDb } = require('./helpers')

const toggleWhatsAppEnabled = async (req, res) => {
  try {
    const userId = req.user._id

    const enabled = await toggleWhatsAppEnabledDb({ userId })

    res.json({ whatsAppEnabled: enabled })
  } catch (err) {
    console.log('Error updating user whatsAppEnabled', err)
    res.sendStatus(500)
  }
}

module.exports = { toggleWhatsAppEnabled }
