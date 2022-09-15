const User = require('../../models/user')
const WhatsAppHandler = require('../whatsApp')
const Queue = require('../queue')

const getUserLinkedToPhone = ({ phone }) => {
  return new Promise((resolve, reject) => {
    User.findOne({ phone }, (err, foundUser) => {
      if (err || !foundUser) {
        return reject(err ? err : 'User not found')
      }
      resolve(foundUser)
    })
  })
}

const handleWhatsAppRequest = async (req, res) => {
  try {
    const data = req.body
    if (
      !data ||
      data.type !== 'message' ||
      !data.body.key ||
      !data.body.key.remoteJid ||
      !data.body.message ||
      !data.body.message.conversation
    ) {
      return res.sendStatus(200)
    }

    const phone = data.body.key.remoteJid.split('@')[0]
    const user = await getUserLinkedToPhone({ phone })
    const msg = data.body.message.conversation.toLowerCase()

    const queue = await Queue.getInstance()
    console.log(queue)
    const whatsAppHandler = await WhatsAppHandler.getInstance()

    if (msg.includes('status')) {
      // send status to user
      whatsAppHandler.sendMessage({
        phone,
        msg: `Momentan befinden sich ${queue.count} Spieler in der Warteschlange.`
      })
    }

    if (msg.includes('ready') || msg.includes('bereit')) {
      const accepted = queue.readyPlayer({ userId: user._id })

      if (accepted) {
        whatsAppHandler.sendMessage({
          phone,
          msg: `Du hast das Match erfolgreich akzeptiert. 🎉`
        })
      } else {
        whatsAppHandler.sendMessage({
          phone,
          msg: `Leider warst du zu spät.`
        })
      }
    }

    res.sendStatus(200)
  } catch (err) {
    console.log(err)
    res.sendStatus(200)
  }
}

module.exports = { handleWhatsAppRequest }
