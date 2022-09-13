const mongoose = require('mongoose')
const Schema = mongoose.Schema

const mapPoolSchema = new Schema({
  active: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: 'Default Pool',
    unique: true
  },
  type: {
    type: String,
    default: 'pug',
    enum: ['pug', '2v2', 'custom']
  },
  maps: {
    type: Array,
    default: [
      {
        name: 'Dust II',
        key: 'de_dust2'
      },
      {
        name: 'Mirage',
        key: 'de_mirage'
      },
      {
        name: 'Nuke',
        key: 'de_nuke'
      },
      {
        name: 'Vertigo',
        key: 'de_vertigo'
      },
      {
        name: 'Inferno',
        key: 'de_inferno'
      },
      {
        name: 'Overpass',
        key: 'de_overpass'
      },
      {
        name: 'Ancient',
        key: 'de_ancient'
      }
    ]
  }
})

const MapPoolSchema = mongoose.model('MapPool', mapPoolSchema)

module.exports = MapPoolSchema
