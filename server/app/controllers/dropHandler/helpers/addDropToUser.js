const User = require('../../../models/user')
const Drop = require('../../../models/drop')
const Match = require('../../../models/match')

const markAsDropped = ({ dropId, userId }) => {
  return new Promise((resolve) => {
    const timestamp = Date.now()
    Drop.findByIdAndUpdate(
      dropId,
      { $set: { dropped: true, ownedBy: userId, droppedTimestamp: timestamp } },
      (err, updatedDrop) => {
        if (err) {
          console.log(err)
        }
        console.log('Updated Drop')
        resolve()
      }
    )
  })
}

const addDropToMatch = ({ matchId, dropId }) => {
  return new Promise((resolve, reject) => {
    Match.findByIdAndUpdate(
      matchId,
      { $push: { drops: dropId } },
      (err, updatedMatch) => {
        if (err) {
          return reject(err)
        }
        resolve()
      }
    )
  })
}

const addDropToUser = ({ userId, dropId, matchId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      await markAsDropped({ userId, dropId })
      await addDropToMatch({ matchId, dropId })
    } catch (err) {
      return reject(err)
    }

    User.findByIdAndUpdate(
      userId,
      { $push: { drops: dropId } },
      (err, updatedUser) => {
        if (err) {
          return reject(err)
        }
        resolve()
      }
    )
  })
}

module.exports = { addDropToUser }
