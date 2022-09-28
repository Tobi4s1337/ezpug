const { emitPublicEvent } = require('../../../socket')

const websiteAnnounce = ({ dropName, username, dropImage }) => {
  emitPublicEvent({ event: 'DROP', data: { dropName, username, dropImage } })
}

module.exports = { websiteAnnounce }
