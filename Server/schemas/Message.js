const mongoose = require('mongoose');
const uuid = require('uuid');
const User = require('./User');

const Message = new mongoose.Schema({
    id: {
        default: uuid.v4(),
        type: String
    },
    datePosted: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: User
    },
    content: {
        default: "", //should be encrypted
        type: String
    }
});

module.exports = mongoose.model('Messages', Message); //Message is the name of the collection in the db