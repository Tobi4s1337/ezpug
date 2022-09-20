const playersToIds = (players) => {
  const ids = []
  for (const player of players) {
    if (player._id) {
      ids.push(player._id)
    } else {
      ids.push(player)
    }
  }
  return ids
}

module.exports = { playersToIds }
