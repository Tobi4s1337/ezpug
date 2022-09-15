const Logger = require('../../Logger')
const logger = new Logger('WhatsApp')
const EventEmitter = require('events').EventEmitter
const User = require('../../models/user')
const axios = require('axios')
const { resolve } = require('path')

const getUserLinkedToPhone = ({ phone }) => {
  return new Promise((resolve, reject) => {
    User.findOne({ phone }, (err, foundUser) => {
      if (err || !foundUser) {
        return reject(err ? err : 'No user found linked to phone number')
      }

      resolve(foundUser)
    })
  })
}

const getPhoneLinkedToUser = ({ userId }) => {
  return new Promise((resolve, reject) => {
    User.findById(userId, (err, foundUser) => {
      if (err || !foundUser || !foundUser.phone) {
        return reject(
          err ? err : 'No user found or user doesnt have phone linked'
        )
      }

      resolve(foundUser.phone)
    })
  })
}

/**
 * @var {Promise<WhatsAppHandler>}
 */
let instance

/**
 * WhatsAppHandler class.
 */
class WhatsAppHandler extends EventEmitter {
  constructor() {
    super()

    logger.info('Creating WhatsAppHandler')
    this._axios = ''
    this._apiBaseUrl = 'http://94.130.180.183:3333'
    this._key = 'ezpug2'
  }

  async init() {
    try {
      this._axios = axios.create({
        baseURL: this._apiBaseUrl
      })

      return this
    } catch (err) {
      console.log('Error creating axios instance:', err)
    }
  }

  async onMessage({ phone, msg }) {
    try {
      const user = await getUserLinkedToPhone({ phone })

      this.emit('message', { userId: user._id, msg })
    } catch (err) {
      logger.error('Unable to handle new message', err)
    }
  }

  validateNumber({ phone }) {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await this._axios.get(
          `/misc/onwhatsapp?key=${this._key}&id=${phone}`
        )
        console.log(data)
        resolve()
      } catch (err) {
        logger.error('Failed to validate number', err)
        reject(err)
      }
    })
  }

  async sendMessage({ phone, msg, userId }) {
    try {
      let vPhone = phone
      if (!phone && userId) {
        vPhone = await getPhoneLinkedToUser({ userId })
      }

      const data = JSON.stringify({
        id: vPhone,
        message: msg
      })

      const result = await this._axios({
        method: 'post',
        url: `/message/text?key=${this._key}`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      })

      resolve()
    } catch (err) {
      console.log(err)
      logger.error('Failed to send message', err)
    }
  }
}

/**
 * @return {Promise<WhatsAppHandler>}
 */
WhatsAppHandler.getInstance = async function () {
  if (!instance) {
    const whatsAppHandler = new WhatsAppHandler()

    instance = await whatsAppHandler.init()
  }

  return instance
}

module.exports = WhatsAppHandler
