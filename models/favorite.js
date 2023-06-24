const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId

const favoriteSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User'
    },
    campsites: [{
        type: ObjectId,
        ref: 'Campsite'
    }]
})

module.exports = mongoose.model('Favorite', favoriteSchema);