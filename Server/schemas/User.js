const mongoose = require('mongoose');
const uuid = require('uuid');

const User = new mongoose.Schema({
    id: {
        default: uuid.v4(),
        type: String
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        min: 3,
        max: 29
    },
    password: {
        type: String,
        required: true,
        trim: true,
        min: 6,
        max: 1000,
    },
    dateJoined: {
        type: Date,
        default: Date.now
    },
    dateLastActive: {
        type: Date,
        default: Date.now
    },
    token: {
        default: [],
        type: [String]
    },
    groups: {
        default: [],
        type: [String]
    }
});

module.exports = mongoose.model('Users', User); //User is the name of the collection in the db