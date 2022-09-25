const User = require('../../../../models/match')
const { emitPrivateEvent } = require('../../../../socket')

const getUserStats = ({ userId }) => {
  return new Promise((resolve, reject) => {
    User.findById(userId, (err, foundUser) => {
      if (err || !foundUser) {
        return reject()
      }

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
      const elo = victory ? existingsStats.elo + 12 : existingStats.elo - 10
      const matchesPlayed = existingsStats.matchesPlayed++

      const match = {
        matchId,
        map,
        teamOneScore,
        teamTwoScore,
        teamOne
      }

      User.findByIdAndUpdate(
        userId,
        {
          $set: {
            stats: { totalKills, totalDeaths, elo, matchesPlayed, matchesWon },
            $push: { matches: match }
          }
        },
        (err, updatedUser) => {
          if (err) {
            reject(err)
          }

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
      reject(err)
    }
  })
}

module.exports = { updateUserStats }
