const express = require('express')
const router = express.Router()

const {
  handleWhatsAppRequest,
  handleDatHostRequest
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
router.post('/datHost/', handleDatHostRequest)

module.exports = router
