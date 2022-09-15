const User = require('../../models/user')
const WhatsAppHandler = require('../../controllers/whatsApp')

const getUserCode = (userId) => {
  return new Promise((resolve, reject) => {
    User.findById(userId, (err, foundUser) => {
      if (err || !foundUser) {
        return reject(err)
      }
      console.log(foundUser)
      resolve(foundUser.whatsAppCode)
    })
  })
}

const setPhone = (userId, phone) => {
  return new Promise((resolve, reject) => {
    console.log('Link', phone)
    User.findByIdAndUpdate(userId, { $set: { phone } }, (err, updatedUser) => {
      if (err) {
        return reject(err)
      }
      resolve(updatedUser)
    })
  })
}

/**
 * Link phone number if code is valid
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const redeemWhatsAppCode = async (req, res) => {
  try {
    const userId = req.user._id
    const code = req.body.code

    console.log('hHi')
    const whatsAppCode = await getUserCode(userId)

    console.log(whatsAppCode)

    if (whatsAppCode === code) {
      await setPhone(userId, req.body.phone)
      res.json({ success: true })

      console.log(req.body.phone)

      const whatsAppHandler = await WhatsAppHandler.getInstance()
      whatsAppHandler.sendMessage({
        phone: req.body.phone,
        msg:
          'Dein EZPUG Profil ist jetzt mit diesem WhatsApp Account verknüpft! 🥳🎉'
      })
      return
    }

    res.json({ success: false })
  } catch (error) {
    console.log('Error redeeming whatsapp code', error)
    res.json({ success: false })
  }
}

module.exports = { redeemWhatsAppCode }
