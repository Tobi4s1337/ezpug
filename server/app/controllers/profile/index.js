const { changePassword } = require('./changePassword')
const { getProfile } = require('./getProfile')
const { updateProfile } = require('./updateProfile')
const { getTeamSpeakUsers } = require('./getTeamSpeakUsers')
const { linkTeamSpeakRequest } = require('./linkTeamSpeakRequest')
const { redeemTeamSpeakCode } = require('./redeemTeamSpeakCode')
const { unlinkTeamSpeak } = require('./unlinkTeamSpeak')

module.exports = {
  changePassword,
  getProfile,
  updateProfile,
  getTeamSpeakUsers,
  linkTeamSpeakRequest,
  redeemTeamSpeakCode,
  unlinkTeamSpeak
}
