const mongoose = require('mongoose');

const Group = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 1,
        maxLength: 15,
        match: [/^(?=.{1,15}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9_]+(?<![_.])$/, "Group name invalid, it should contain 1-15 alphanumeric letters and be unique!"], 
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
    messageDeleteTime: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Groups', Group); //Group is the name of the collection in the db