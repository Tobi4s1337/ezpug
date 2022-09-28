const serverAnnounce = ({ server, username, dropName, dropSound }) => {
  return new Promise((resolve, reject) => {
    let rcon = require('srcds-rcon')({
      address: server,
      password: '1pugsaar'
    })

    rcon
      .connect()
      .then(() => {
        console.log('Connected to server')
        return rcon
          .command(
            `announce_itemdrop "${username}" "${dropName}" "${dropSound}"`
          )
          .then(() => {
            console.log('Dropped Item')
            resolve()
          })
      })
      .then(() => rcon.disconnect())
      .catch((err) => {
        console.log('caught', err)
        reject(err)
      })
  })
}

module.exports = { serverAnnounce }
