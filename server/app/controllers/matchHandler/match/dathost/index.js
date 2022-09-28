const { cloneServer } = require('./cloneServer')
const { updateServer } = require('./updateServer')
const { deleteServer } = require('./deleteServer')
const { createMatch } = require('./createMatch')
const { generateGSLT } = require('./generateGSLT')
const { downloadDemo } = require('./downloadDemo')
const { stopServer } = require('./stopServer')

module.exports = {
  cloneServer,
  updateServer,
  deleteServer,
  createMatch,
  generateGSLT,
  downloadDemo,
  stopServer
}
