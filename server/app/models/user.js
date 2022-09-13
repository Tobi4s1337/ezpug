const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const Schema = mongoose.Schema

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    avatar: {
      type: String
    },
    email: {
      type: String,
      validate: {
        validator: validator.isEmail,
        message: 'EMAIL_IS_NOT_VALID'
      },
      lowercase: true,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    teamSpeakCode: {
      type: String
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    verification: {
      type: String
    },
    verified: {
      type: Boolean,
      default: false
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    blockExpires: {
      type: Date,
      default: Date.now,
      select: false
    },
    steamId: {
      type: String,
      unique: true,
      sparse: true
    },
    teamSpeakId: {
      type: String,
      unique: true
    },
    csgoId: {
      type: String,
      unique: true,
      sparse: true
    },
    steamUrl: {
      type: String,
      dropDups: true,
      unique: true,
      sparse: true
    },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    sentFriendRequests: [
      { type: Schema.Types.ObjectId, ref: 'FriendRequests' }
    ],
    receivedFriendRequests: [
      { type: Schema.Types.ObjectId, ref: 'FriendRequests' }
    ],
    status: {
      online: {
        type: Boolean,
        default: false
      },
      inQueue: {
        type: Boolean,
        default: false
      },
      match: {
        active: {
          type: Boolean,
          default: false
        },
        isTeamOne: {
          type: Boolean,
          default: false
        },
        status: {
          type: String,
          enum: ['playerveto', 'mapveto', 'active', 'finished']
        },
        score: {
          teamOne: {
            type: Number,
            default: 0
          },
          teamTwo: {
            type: Number,
            default: 0
          }
        }
      },
      lastSeen: {
        type: Date,
        default: Date.now()
      },
      teamSpeak: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

const hash = (user, salt, next) => {
  bcrypt.hash(user.password, salt, (error, newHash) => {
    if (error) {
      return next(error)
    }
    user.password = newHash
    return next()
  })
}

const genSalt = (user, SALT_FACTOR, next) => {
  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) {
      return next(err)
    }
    return hash(user, salt, next)
  })
}

UserSchema.pre('save', function (next) {
  const that = this
  const SALT_FACTOR = 5
  if (!that.isModified('password')) {
    return next()
  }
  return genSalt(that, SALT_FACTOR, next)
})

UserSchema.methods.comparePassword = function (passwordAttempt, cb) {
  bcrypt.compare(passwordAttempt, this.password, (err, isMatch) =>
    err ? cb(err) : cb(null, isMatch)
  )
}
UserSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('User', UserSchema)
