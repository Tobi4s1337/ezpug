const express = require('express')
const router = express.Router()

const {
  handleWhatsAppRequest,
  handleDathostRoundRequest,
  handleDathostMatchRequest
} = require('../controllers/webhook')

/*
 * Webhook routes
 */

/*
 * WhatsApp webhook
 */
router.post('/whatsApp', handleWhatsAppRequest)

/*
 * DatHost webhook
 */
router.post('/dathost-round/:matchId', handleDathostRoundRequest)

router.post('/dathost-match/:matchId', handleDathostMatchRequest)

module.exports = router
