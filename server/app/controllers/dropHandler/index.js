const Logger = require('../../Logger')
const logger = new Logger('DropHandler')

const {
  addDropToUser,
  getRandomDrop,
  getRandomUser,
  projectorAnnounce,
  serverAnnounce,
  websiteAnnounce,
  getServer
} = require('./helpers')

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

/**
 * @var {Promise<DropHandler>}
 */
let instance

/**
 * DropHandler Singleton class.
 */
class DropHandler {
  constructor() {
    logger.info('Creating DropHandler')

    this._enabled = false
    this._odds = 80
    this._interval = 5 * 1000 * 60
    this._timeout = null
  }

  async init() {
    try {
      return this
    } catch (err) {
      logger.error('Error creating DropHandler:', err)
    }
  }

  async drop() {
    try {
      logger.info('Executing drop logic')
      const drop = await getRandomDrop()
      logger.info('Got drop:', drop.name)
      const user = await getRandomUser()
      logger.info('Got random user:', user.name)
      const matchId = user.status.match.matchId
      const server = await getServer({ matchId })
      logger.info('Got server where we will announce drop:', server)

      await addDropToUser({ userId: user._id, matchId, dropId: drop._id })
      logger.info('Added drop to user')

      await projectorAnnounce({
        dropName: drop.name,
        username: user.name,
        dropImage: drop.image
      })
      logger.info('Announced drop on projector')

      setTimeout(async () => {
        try {
          websiteAnnounce({
            dropName: drop.name,
            username: user.name,
            dropImage: drop.image
          })
          logger.info('Announced drop on website')

          await serverAnnounce({
            server,
            dropName: drop.name,
            dropSound: drop.sound,
            username: user.name
          })
          logger.info('Announced drop on server')
        } catch (err) {
          logger.error('Failed to announce drop', err)
        }
      }, 3000)
    } catch (err) {
      logger.error('Failed to execute drop', err)
    }
  }

  enableDrops() {
    this._enabled = true

    this._timeout = setTimeout(() => {
      this.checkDrop()
    }, this._interval)
  }

  disableDrops() {
    this._enabled = false
    if (this._timeout) {
      clearTimeout(this._timeout)
    }
  }

  checkDrop() {
    logger.error('Checking if we should drop an item now...')
    const randomNumber = getRandomInt(100)

    try {
      if (randomNumber < this._odds) {
        try {
          logger.info('Dropping now and resetting odds to 4')
          this.drop()
          this._odds = 4
        } catch (e) {
          logger.error('Failed to drop:', e)
        }
      } else {
        this._odds += 5
        logger.info(`Didn't drop, new odds are:`, this._odds)
      }
    } catch (err) {
      logger.error('Failed to check drop', err)
    }

    if (this._enabled) {
      this._timeout = setTimeout(() => {
        this.checkDrop()
      }, this._interval)
    }
  }
}

/**
 * @return {Promise<DropHandler>}
 */
DropHandler.getInstance = async function () {
  if (!instance) {
    const dropHandler = new DropHandler()

    instance = await dropHandler.init()
  }

  return instance
}

module.exports = DropHandler
