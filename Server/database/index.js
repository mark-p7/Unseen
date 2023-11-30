const mongoose = require('mongoose');
const fs = require('fs');
const UserModel = require("../schemas/User.js");
const GroupModel = require("../schemas/Group.js");
const MessageModel = require("../schemas/Message.js")
require("dotenv").config();;

const MONGO_URI = process.env.MONGO_URI;

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

mongoose.connect(MONGO_URI, options).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const db = mongoose.connection;

module.exports = db;
