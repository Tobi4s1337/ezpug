const User = require('../../../../models/user')
const { emitPrivateEvent } = require('../../../../socket')

const getUserStats = ({ userId }) => {
  console.log('ukuru')
  return new Promise((resolve, reject) => {
    User.findById(userId, (err, foundUser) => {
      if (err || !foundUser) {
        console.log('nope, not found', userId)
        console.log(err)
        return reject(err)
      }
      console.log('go user stats')
      resolve(foundUser.stats)
    })
  })
}

const updateUserStats = ({
  userId,
  stats,
  teamOne,
  teamOneScore,
  teamTwoScore,
  matchId,
  map
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingStats = await getUserStats({ userId })
      console.log('nani')
      console.log(existingStats)
      let victory = false

      if (
        (teamOneScore > teamTwoScore && teamOne) ||
        (teamTwoScore > teamOneScore && teamTwo)
      ) {
        victory = true
      }

      let recentResults = existingStats.recentResults
      recentResults.pop()

      if (victory) {
        recentResults.push('W')
      } else {
        recentResults.push('L')
      }

      const kills = stats.kills ? stats.kills : 0
      const deaths = stats.deaths ? stats.deaths : 0

      const totalKills = existingStats.totalKills + kills
      const totalDeaths = existingStats.totalDeaths + deaths
      const matchesWon = victory
        ? existingStats.matchesWon + 1
        : existingStats.matchesWon
      const elo = victory ? existingStats.elo + 12 : existingStats.elo - 10
      const matchesPlayed = existingStats.matchesPlayed++

      const match = {
        matchId,
        map,
        teamOneScore,
        teamTwoScore,
        teamOne
      }
      console.log('uwuw')
      User.findByIdAndUpdate(
        userId,
        {
          $set: {
            stats: { totalKills, totalDeaths, elo, matchesPlayed, matchesWon, recentResults },
            $push: { matches: match }
          }
        },
        (err, updatedUser) => {
          if (err) {
            reject(err)
          }

          console.log('wwwww')
          emitPrivateEvent(userId, 'MATCH_RESULT', {
            victory,
            oldElo: existingStats.elo,
            newElo: elo,
            matchId
          })
          resolve(updatedUser)
        }
      )
    } catch (err) {
      console.log(err)
      reject(err)
    }
  })
}

module.exports = { updateUserStats }
