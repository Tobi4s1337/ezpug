const mongoose = require('mongoose')

const Schema = mongoose.Schema

const FriendRequestSchema = new Schema(
  {
    requested: { type: Schema.Types.ObjectId, ref: 'Users' },
    recipient: { type: Schema.Types.ObjectId, ref: 'Users' }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
module.exports = mongoose.model('FriendRequest', FriendRequestSchema)
