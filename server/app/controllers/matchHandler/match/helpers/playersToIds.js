const playersToIds = (players) => {
  const ids = []
  for (const player of players) {
    if (player._id) {
      ids.push(player._id.toString())
    } else {
      ids.push(player.toString())
    }
  }
  return ids
}

module.exports = { playersToIds }
