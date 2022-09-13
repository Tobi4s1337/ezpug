const playersToIds = (players) => {
  const ids = []
  for (const player of players) {
    ids.push(player._id)
  }
  return ids
}

module.exports = { playersToIds }
