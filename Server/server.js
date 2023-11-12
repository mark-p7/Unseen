const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const db = require('./database/index.js');
const fs = require('fs');
const https = require('https');
const { Server } = require("socket.io");
const cors = require('cors');
const UserModel = require('./schemas/User.js')
const GroupModel = require('./schemas/Group.js')
const MessageModel = require('./schemas/Message.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
// Errors
const {
    BadRequestError,
    DbError,
    MissingIdError,
    NotFoundError,
    InvalidRouteError,
    InvalidCredentialsError } = require('./errors/errorHandling.js')

// Configure enviornment variables
dotenv.config();

// Initialize server
const app = express();
const port = 8080;

// Add middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

// Create server
const server = https.createServer({
    key: fs.readFileSync('./conf/key.pem'),
    cert: fs.readFileSync('./conf/cert.pem'),
    passphrase: 'pass',
}, app);

// Create socket
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        allowedHeaders: ["my-custom-header"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Socket connection
io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on('chat-message', (msg) => {
        console.log('message: ' + msg);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Async Wrapper Function to handle errors
const asyncWrapper = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            return next(error)
            // res.status(400).json({ errName: error.name, errMsg: error.message })
        }
    }
}

// Generate Access Token
function generateAccessToken(userId) {
    return jwt.sign(userId, process.env.TOKEN_SECRET, { expiresIn: "2h" });
}

// Add routes
app.get('/', (req, res) => {
    res.send("/");
});

/**
 * This route will be used to register a new user
 * @param {req} req = { username: String, password: String }
 * @returns {res} res = { success: Boolean, message: String, cookie: String }
 */
app.post('/api/register', asyncWrapper(async (req, res) => {
    // Obtaining body parameters
    const { username, password } = req.body;

    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Setting user password
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create User with Hashed password object
    const userHashedPass = { username: username, password: hashedPassword }

    // Creates the User
    try {
        const user = await UserModel.create({ ...userHashedPass })
        const token = generateAccessToken({ _id: user._id })
        user.token.push(token);
        await user.save();

        // Set header and send response
        res.header('auth-token', token)
        res.status(201).json(user)
    } catch (err) {
        throw new DbError("Cannot create user")
    }
}));

/**
 * This route will be used to login a new user 
 * @param {req} req = { username: String, password: String }
 * @returns {res} res = { success: Boolean, message: String, cookie: String }
 */
app.post('/api/login', asyncWrapper(async (req, res) => {
    // Get Request body
    const { username, password } = req.body;

    // Validate User input
    if (!(username && password)) throw Error("All inputs are required")

    // Find User
    const user = await UserModel.findOne({ username })
    if (user && (await bcrypt.compare(password, user.password))) {

        // Check for Token
        if (user.token.length != 0) {
            // Set header and send response
            res.header('auth-token', user.token[0])
            res.json(user)
            return;
        }

        // Generate Token and Send response back to client
        const token = generateAccessToken({ _id: user._id })
        console.log(token)
        user.token.push(token);
        await user.save();

        // Set header and send response
        res.header('auth-token', token)
        res.json(user)

        // Throw Errors if User does not exist or password is incorrect
    } else if (!user) throw new InvalidCredentialsError("Incorrect Username or Password")
    else throw new InvalidCredentialsError("Incorrect Username or Password")
}))

app.post("/api/logout", asyncWrapper(async (req, res) => {
    // Get Request body
    const { token } = req.body;

    // Validate User input
    if (!token) throw Error("All inputs are required")

    // Find User
    const user = await UserModel.findOne({ token: token })
    if (user) {
        const newTokens = user.token.filter((t) => t !== token)
        user.token = newTokens
        await user.save()
        res.status(200).json(user)
    } else {
        throw new Error("User does not exist")
    }
}));

app.post('/api/validateToken', asyncWrapper(async (req, res) => {
    // Get Request body
    const { token } = req.body;

    // Validate User input
    if (!token) throw Error("All inputs are required")

    // Find User
    const user = await UserModel.findOne({ token: token })
    if (user) {
        res.json(user)
    } else {
        throw new Error("User does not exist")
    }
}))

/**
 * This route will be used to create a new group
 * @param {req} req = { groupName: String, groupPassword: String, token: String }
 * @returns {res} res = { success: Boolean, message: String, cookie: String } may need to be changed
 */
app.post('/api/createGroup', asyncWrapper(async (req, res) => {
    // Obtaining body parameters
    const { groupName, groupPassword, token} = req.body;

    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Setting group password
    const hashedPassword = await bcrypt.hash(groupPassword, salt)
    
    // Creates the Group
    try {
        const user = await UserModel.findOne({ token: token })
   
        const group = await GroupModel.create({ groupName: groupName, groupPassword: hashedPassword, groupOwnerId: user.id, 
            groupMembers: user.id})
        
        console.log(group);

        user.groups.push(group._id);

        await user.save();
        await group.save();
        
        res.status(200).json(group);
    } catch (err) {
        throw new DbError("Cannot create group")
    }
}));

app.post('/api/getGroups', asyncWrapper(async (req, res) => {

    const{token} = req.body;

    try {
        const user = await UserModel.findOne({ token: token })
        const groupids = user.groups;
        console.log(groupids);
        const groups = [];
        for (let i =0; i < groupids.length; i++) {
            console.log(groupids[i]);
            const group = await GroupModel.findOne({ _id: groupids[i]})
            console.log('group: ', group);
            groups.push(group);
        }

        res.json(groups);
    } catch (err) {
        throw new DbError("Can't get groups")
    }
}))

app.post('/api/getGroup', asyncWrapper(async (req, res) => {

    const{groupid} = req.body;
    console.log("group id: ", groupid);

    try {
        const group = await GroupModel.findOne({ _id: groupid.groupid })
        //console.log("<1>");
        //console.log(group);
        res.json(group);

    } catch (err) {
        throw new DbError("Can't get group")
    }
}))

app.post('/api/getGroupMembers', asyncWrapper(async (req, res) => {

    const{memberids} = req.body;
    console.log("member ids: ", memberids);

    try {
        const members = [];
        for (let i =0; i < memberids.length; i++) {
            const user = await UserModel.findOne({ id: memberids[i]})
            members.push(user);
        }
        console.log('members: ', members);
        res.json(members);

    } catch (err) {
        throw new DbError("Can't get group members")
    }
}))

app.post('/api/joinGroup', asyncWrapper(async (req, res) => {

    const{groupid, groupPass, token} = req.body;

    try {
        const user = await UserModel.findOne({ token: token })
        const group = await GroupModel.findone({ _id: groupid })
        
        if (group && (await bcrypt.compare(groupPass, group.groupPassword))) {
            group.groupMembers.push(user.id);
            user.groups.push(group._id);

            await group.save();
            await user.save();

            res.status(200);
        } else if (!group) throw new InvalidCredentialsError("Incorrect Group or Password")
        else throw new InvalidCredentialsError("Incorrect Group or Password")

        
    } catch (err) {
        throw new DbError("Can't join group")
    }
}))

app.post('/api/leaveGroup', asyncWrapper(async (req, res) => {

    const{groupid, token} = req.body;

    try {
        const user = await UserModel.findOne({ token: token })
        const group = await GroupModel.findone({ _id: groupid })
        
        group.groupMembers.pull(user.id);
        user.groups.pull(group._id);

        await group.save();
        await user.save();

        res.status(200);
        
    } catch (err) {
        throw new DbError("Can't leave group")
    }
}))

app.post('/api/removeMember', asyncWrapper(async (req, res) => {

    const{groupid, userid} = req.body;

    try {
        const user = await UserModel.findOne({ id: userid })
        const group = await GroupModel.findone({ _id: groupid })
        
        group.groupMembers.pull(user.id);
        user.groups.pull(group._id);

        await group.save();
        await user.save();

        res.status(200);
        
    } catch (err) {
        throw new DbError("Can't leave group")
    }
}))

app.post('/api/deleteGroup', asyncWrapper(async (req, res) => {

    const{groupid} = req.body;

    try {
        const group = await GroupModel.findOne({ _id: groupid.groupid })

        for (let i = 0; i < group.groupMembers.length; i++) {
            const user = await UserModel.findOne({ id: group.groupMembers[i]})
            console.log("user: ", user);
            user.groups.pull(group._id);
            await user.save();
            console.log("after remove group: ", user);
        }

        await GroupModel.deleteOne({ _id: groupid.groupid })

        res.status(200);

    } catch (err) {
        throw new DbError("Can't delete group")
    }
}))

// Catch all other routes
app.get('*', asyncWrapper(async (req, res) => {
    throw new Error("Invalid route: please check documentation")
}))

// Next Middleware to handle errors
app.use((err, req, res, next) => {
    if (!err.code) {
        err.code = 500;
    }
    console.log(req.body)
    // Sends detailed error message to client
    res.status(err.code).json({ errName: err.name, errMsg: err.message, errCode: err.code, errStack: err.stack })
    // Sends user friendly error message to client
    //res.status(err.code).json({ errName: err.name, errMsg: err.message, errCode: err.code })
})

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});