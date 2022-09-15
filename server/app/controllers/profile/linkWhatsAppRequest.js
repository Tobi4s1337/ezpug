const WhatsAppHandler = require('../../controllers/whatsApp')
const User = require('../../models/user')

const generateCode = () => {
  return (Math.floor(Math.random() * 10000) + 10000).toString().substring(1)
}

const checkLinked = (phone) => {
  return new Promise((resolve, reject) => {
    User.findOne({ phone }, (err, foundUser) => {
      if (err || !foundUser) {
        return resolve(false)
      }
      resolve(true)
    })
  })
}

const setUserCode = (userId, code) => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      userId,
      { $set: { whatsAppCode: code } },
      (err, updatedUser) => {
        if (err) {
          return reject(err)
        }
        resolve(updatedUser)
      }
    )
  })
}

/**
 * Get all current teamspeak users
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const linkWhatsAppRequest = async (req, res) => {
  try {
    const phone = req.body.phone
    const linked = await checkLinked(phone)

    if (linked) {
      return res.sendStatus(400)
    }

    const whatsAppHandler = await WhatsAppHandler.getInstance()

    await whatsAppHandler.validateNumber({ phone })

    const code = generateCode()
    const userId = req.user._id
    await setUserCode(userId, code)

    whatsAppHandler.sendMessage({
      phone,
      msg: `Bitte gebe den folgenden Code auf der EZPUG Website ein um deine Handynummer zu verlinken: ${code}`
    })

    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

module.exports = { linkWhatsAppRequest }
