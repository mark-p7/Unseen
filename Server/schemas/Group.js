const mongoose = require('mongoose');
const uuid = require('uuid');
const User = require('./User');
const Message = require('./Message');

const Group = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        min: 1,
        max: 15
    },
    groupOwnerId: {
        type: String
    },
    groupMembers: {
       type: [String]
    },
    groupMemberCount: {
        type: Number,
        default: 1
    },
    messages: {
        type: [String]
    }//add message delete date later
});

module.exports = mongoose.model('Groups', Group); //Group is the name of the collection in the db