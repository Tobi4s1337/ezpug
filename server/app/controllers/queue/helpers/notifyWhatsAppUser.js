const User = require('../../../models/user')
const WhatsAppHandler = require('../../../controllers/whatsApp')

const notifyWhatsAppUser = ({ userId, event, data }) => {
  User.findById(userId, async (err, foundUser) => {
    if (err || !foundUser || !foundUser.phone || !foundUser.whatsAppEnabled) {
      return console.log(err ? err : 'User doesnt have whatsapp enabled')
    }

    let msg = ''
    let players = null

    switch (event) {
      case 'queue_ready':
        msg =
          '📢 Ein Spiel wurde gefunden! Antworte innerhalb der nächsten 30 Sekunden mit "ready" oder "bereit" um teilzunehmen. 📢'
        break
      case 'queue_kick':
        msg =
          'Du wurdest aus der Warteschlange entfernt, da du nicht rechtzeitig angenommen hast.'
        break
      case 'queue_timeout':
        players = data.unreadyNames.join(',')
        msg = `Die folgenden Spieler haben nicht rechtzeitig angenommen: ${players}\nDu bist weiterhin in der Warteschlange.`
      case 'queue_success':
        players = data.playerNames.join('\n')
        msg = `Alle 10 Spieler sind bereit und das Veto startet jetzt. 🥳\nDie folgenden Spieler nehmen Teil: ${players}`
        break
      default:
        break
    }

    try {
      const whatsAppHandler = await WhatsAppHandler.getInstance()
      whatsAppHandler.sendMessage({
        phone: foundUser.phone,
        msg
      })
    } catch (err) {
      console.log(err)
    }
  })
}

module.exports = { notifyWhatsAppUser }
