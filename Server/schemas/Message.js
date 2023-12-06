const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
require("dotenv").config();

const Message = new mongoose.Schema({
    datePosted: {
        type: Date,
        default: Date.now
    },
    user: {
        type: String // User id
    },
    displayName: {
        type: String // user display name
    },
    group: {
        type: String // Group id
    },
    content: {
        default: "", // Should be encrypted
        type: String
    }
});

var encKey = process.env.SOME_32BYTE_BASE64_STRING;
var sigKey = process.env.SOME_64BYTE_BASE64_STRING;

Message.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey, encryptedFields: ['content'] });

module.exports = mongoose.model('Messages', Message); //Message is the name of the collection in the db
