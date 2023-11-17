const mongoose = require('mongoose');
const uuid = require('uuid');
const User = require('./User');

const Message = new mongoose.Schema({
    datePosted: {
        type: Date,
        default: Date.now
    },
    user: {
        type: String // User id
    },
    content: {
        default: "", // Should be encrypted
        type: String
    }
});

module.exports = mongoose.model('Messages', Message); //Message is the name of the collection in the db