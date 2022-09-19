const MapPool = require('../../../../models/mapPool')

const getActiveMapPool = ({ type }) => {
  return new Promise((resolve, reject) => {
    MapPool.findOne(
      { active: true, type: type ? type : 'pug' },
      (err, mapPool) => {
        if (err || !mapPool) {
          return reject(err ? err : 'No active map-pool')
        }
        resolve(mapPool)
      }
    )
  })
}

module.exports = { getActiveMapPool }
