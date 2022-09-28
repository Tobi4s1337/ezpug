const mongoose = require('mongoose')
const Schema = mongoose.Schema

const matchSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['pug', 'custom', '2v2']
    },
    status: {
      type: String,
      enum: ['playerveto', 'mapveto', 'active', 'finished', 'cancelled'],
      default: 'playerveto'
    },
    server: Object,
    gotv: String,
    mapVeto: {
      pool: Object,
      teamOneBans: [String],
      teamTwoBans: [String]
    },
    map: Object,
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: {
          select:
            '_id avatar name role steamId teamSpeakId csgoId steamUrl stats'
        }
      }
    ],
    teamOne: {
      name: String,
      roundsWon: Number,
      players: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
          autopopulate: {
            select:
              '_id avatar name role steamId teamSpeakId csgoId steamUrl stats'
          }
        }
      ],
      captain: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: {
          select:
            '_id avatar name role steamId teamSpeakId csgoId steamUrl stats'
        }
      }
    },
    teamTwo: {
      name: String,
      roundsWon: Number,
      players: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
          autopopulate: {
            select:
              '_id avatar name role steamId teamSpeakId csgoId steamUrl stats'
          }
        }
      ],
      captain: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: {
          select:
            '_id avatar name role steamId teamSpeakId csgoId steamUrl stats'
        }
      }
    },
    demoLink: String,
    stats: [],
    teamSpeak: {
      mainCid: String,
      statusCid: String,
      talkCid: String,
      teamOneCid: String,
      teamTwoCid: String
    },
    drops: [{ type: Schema.Types.ObjectId, ref: 'Drop' }]
  },
  { timestamps: true }
)

matchSchema.plugin(require('mongoose-autopopulate'))

const Match = mongoose.model('Match', matchSchema)

module.exports = Match
