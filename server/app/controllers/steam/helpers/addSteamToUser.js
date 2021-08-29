const User = require('../../../models/user')
const { itemNotFound } = require('../../../middleware/utils')
const SteamAPI = require('steamapi')
const steam = new SteamAPI(process.env.STEAM_API_KEY)
const SteamID = require('steamid')

/**
 * Gets csgo user id from steam id
 * @param {string} steamid - steam id
 */
const getCsgoId = (steamId = '') => {
  const sid = new SteamID(steamId)
  const csgoId = sid.getSteam2RenderedID(true)
  return csgoId
}

/**
 * Gets info about steam id
 * @param {string} steamid - steam id
 */
const getSteamUserInfo = (steamId = '') => {
  return new Promise((resolve, reject) => {
    try {
      steam.getUserSummary(steamId).then((summary) => {
        summary.csgoId = getCsgoId(steamId)
        resolve(summary)
      })
    } catch (e) {
      reject(error)
    }
  })
}

/**
 * Adds steam info to user
 * @param {string} userId - user id
 * @param {string} steamId - decrypted steam id
 */
const addSteamToUser = (userId = '', steamId = '') => {
  return new Promise(async (resolve, reject) => {
    const steamUserInfo = await getSteamUserInfo(steamId)
    const updatedData = {
      steamId,
      csgoId: steamUserInfo.csgoId,
      steamUrl: steamUserInfo.url
    }
    User.findByIdAndUpdate(
      userId,
      updatedData,
      {
        new: true,
        runValidators: true,
        select: '-role -_id -updatedAt -createdAt'
      },
      async (err, user) => {
        try {
          await itemNotFound(err, user, 'NOT_FOUND')
          resolve(updatedData)
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

module.exports = { addSteamToUser }
