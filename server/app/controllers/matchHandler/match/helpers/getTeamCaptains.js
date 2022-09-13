const getTeamCaptains = ({ players }) => {
  const randomized = players.sort(() => 0.5 - Math.random())

  return {
    teamOneCaptain: randomized[0],
    teamTwoCaptain: randomized[1]
  }
}

module.exports = { getTeamCaptains }
