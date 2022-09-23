const getFutureTime = ({ timeAdded }) => {
  let timeObject = new Date()
  timeObject = new Date(timeObject.getTime() + timeAdded)
  return timeObject.valueOf()
}

module.exports = { getFutureTime }
