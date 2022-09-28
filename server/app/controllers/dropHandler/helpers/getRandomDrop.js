const Drop = require('../../../models/drop')

const getRandomDrop = () => {
  return new Promise((resolve, reject) => {
    Drop.find({ dropped: false }, (err, drops) => {
      if (err || !drops || drops.length === 0) {
        return reject('no drops exist')
      } else {
        const drop = drops[Math.floor(Math.random() * drops.length)]
        resolve(drop)
      }
    })
  })
}

module.exports = { getRandomDrop }
