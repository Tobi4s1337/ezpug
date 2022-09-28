const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate-v2')

const dropSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  sound: {
    type: String,
    required: true,
    default: 'ui\\item_drop3_rare'
  },
  dropped: {
    type: Boolean,
    default: false
  },
  redeemed: {
    type: Boolean,
    default: false
  },
  droppedTimestamp: {
    type: String
  },
  ownedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: {
      select: '_id avatar name'
    }
  }
})

dropSchema.plugin(require('mongoose-autopopulate'))
dropSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('Drop', dropSchema)
