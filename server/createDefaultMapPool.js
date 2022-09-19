const MapPool = require('./app/models/mapPool')

const DEFAULT_POOL = {
  active: true,
  name: 'Default Pool',
  type: 'pug',
  maps: [
    {
      name: 'Dust II',
      key: 'de_dust2'
    },
    {
      name: 'Mirage',
      key: 'de_mirage'
    },
    {
      name: 'Nuke',
      key: 'de_nuke'
    },
    {
      name: 'Vertigo',
      key: 'de_vertigo'
    },
    {
      name: 'Inferno',
      key: 'de_inferno'
    },
    {
      name: 'Overpass',
      key: 'de_overpass'
    },
    {
      name: 'Ancient',
      key: 'de_ancient'
    }
  ]
}

const doesDefaultPoolExist = () => {
  return new Promise((resolve, reject) => {
    MapPool.findOne({ name: DEFAULT_POOL.name }, (err, foundPool) => {
      if (err || !foundPool) {
        return resolve(false)
      }
      resolve(foundPool)
    })
  })
}

const createDefaultMapPool = () => {
  return new Promise(async (resolve, reject) => {
    const defaultPool = await doesDefaultPoolExist()
    if (defaultPool) {
      return resolve(defaultPool)
    }
    MapPool.create(DEFAULT_POOL, (err, newPool) => {
      if (err) {
        return reject(err)
      }
      resolve(newPool)
    })
  })
}

module.exports = { createDefaultMapPool }
