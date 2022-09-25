const { cloneServer } = require('./cloneServer')
const { updateServer } = require('./updateServer')
const { deleteServer } = require('./deleteServer')
const { createMatch } = require('./createMatch')
const { generateGSLT } = require('./generateGSLT')

module.exports = {
  cloneServer,
  updateServer,
  deleteServer,
  createMatch,
  generateGSLT
}
