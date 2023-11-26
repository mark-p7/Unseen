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

let groupUsers = {}; //a dictionary with key = groupId and value = array of socket ids

io.on("connection", (socket) => {
    io.emit("users-response", groupUsers);
    console.log("a user connected");

    socket.on("enter-group", (groupId) => {
        socket.join(groupId);
        groupUsers = {
            ...groupUsers,
            [groupId]: [...(groupUsers[groupId] ?? []), socket.id],
        };
        io.emit("users-response", groupUsers);
        console.log(`User with ID: ${socket.id} joined group: ${groupId}`);
    });

    socket.on('chat-message', (msg) => {
        console.log('message: ' + msg);
    });

    socket.on("send-message", (data) => {
        console.log("emitting receive");
        io.emit("receive-message", data);
    });

    socket.on("typing", (data) => {
        socket.broadcast.emit("typing-response", data);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        for (const [groupId, users] of Object.entries(groupUsers)) {
            if (users.includes(socket.id)) {
                groupUsers[groupId] = [...users.filter((id) => id !== socket.id)];
                io.emit("receive-message", {
                    text: "A user left the group.",
                    socketId: "abcd",
                    groupId: groupId,
                });
            }
        }
        io.emit("users-response", groupUsers);
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

// Next Middleware to handle errors
app.use((err, req, res, next) => {
    if (!err.code) {
        err.code = 500;
    }
    console.log(req.body)
    // Sends detailed error message to client
    res.status(err.code).json({ errName: err.name, errMsg: err.message, errCode: err.code, errStack: err.stack })
    // Sends user friendly error message to client
    res.status(err.code).json({ errName: err.name, errMsg: err.message, errCode: err.code })
})

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


// This route will be used to create a new group
app.post('/api/createGroup', asyncWrapper(async (req, res) => {
    // Obtaining body parameters
    const { groupName, token } = req.body;

    // Creates the Group
    try {
        const user = await UserModel.findOne({ token: token })

        const group = await GroupModel.create({
            groupName: groupName, groupOwnerId: user.id,
            groupMembers: user.id
        })

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

    const { token } = req.body;

    try {
        const user = await UserModel.findOne({ token: token })
        const groupids = user.groups;
        console.log(groupids);
        const groups = [];
        for (let i = 0; i < groupids.length; i++) {
            console.log(groupids[i]);
            const group = await GroupModel.findOne({ _id: groupids[i] })
            console.log('group: ', group);
            groups.push(group);
        }

        res.json(groups);
    } catch (err) {
        throw new DbError("Can't get groups")
    }
}))

app.post('/api/getGroup', asyncWrapper(async (req, res) => {

    const { groupid } = req.body;
    console.log("group id: ", groupid);

    try {
        const group = await GroupModel.findOne({ _id: groupid })
        //console.log("<1>");
        //console.log(group);
        res.json(group);

    } catch (err) {
        throw new DbError("Can't get group")
    }
}))

app.post('/api/getGroupMembers', asyncWrapper(async (req, res) => {

    const { groupid } = req.body;
    console.log("group id: ", groupid);

    try {
        const group = await GroupModel.findOne({ _id: groupid })

        const members = [];
        for (let i = 0; i < group.groupMemberCount; i++) {
            const user = await UserModel.findOne({ id: group.groupMembers[i] })
            members.push(user.displayName);
        }
        console.log('members: ', members);
        res.json(members);

    } catch (err) {
        throw new DbError("Can't get group members")
    }
}))

app.post('/api/joinGroup', asyncWrapper(async (req, res) => {

    const { groupid, token } = req.body;

    try {
        const user = await UserModel.findOne({ token: token })

        const group = await GroupModel.findOne({ _id: groupid })

        if (user != undefined && user != null && !user.groups.includes(groupid)) {
            group.groupMembers.push(user.id);
            group.groupMemberCount = group.groupMemberCount + 1;
            user.groups.push(group._id);
            user.invites.pull(group._id);

            await group.save();
            await user.save();
        }

        res.status(200).json("Group joined");

    } catch (err) {
        throw new DbError("Can't join group")
    }
}))

app.post('/api/leaveGroup', asyncWrapper(async (req, res) => {

    const { groupid, token } = req.body;

    try {
        const user = await UserModel.findOne({ token: token })
        const group = await GroupModel.findOne({ _id: groupid })

        if (!group.groupOwnerId.includes(user.id)) {

            group.groupMembers.pull(user.id);
            group.groupMemberCount = group.groupMemberCount - 1;
            user.groups.pull(group._id);

            await group.save();
            await user.save();
        }

        res.status(200).json("Left group");

    } catch (err) {
        throw new DbError("Can't leave group")
    }
}))

app.post('/api/removeMember', asyncWrapper(async (req, res) => {

    const { groupid, userid } = req.body;

    try {
        const user = await UserModel.findOne({ id: userid })
        console.log(user);
        const group = await GroupModel.findOne({ _id: groupid })
        console.log(group);

        if (group.groupOwnerId.includes(user.id)) {
            group.groupMembers.pull(user.id);
            group.groupMemberCount = group.groupMemberCount - 1;
            user.groups.pull(group._id);

            await group.save();
            await user.save();
        }

        res.status(200).json("Member removed");

    } catch (err) {
        throw new DbError("Can't remove member")
    }
}))

app.post('/api/deleteGroup', asyncWrapper(async (req, res) => {

    const { groupid, token } = req.body;

    try {
        const user = await UserModel.findOne({ token: token })
        const group = await GroupModel.findOne({ _id: groupid })

        if(group.groupOwnerId.includes(user.id)){

            for (let i = 0; i < group.groupMembers.length; i++) {
                const user = await UserModel.findOne({ id: group.groupMembers[i] })
                console.log("user: ", user);
                user.groups.pull(group._id);
                await user.save();
                console.log("after remove group: ", user);
            }
    
            await GroupModel.deleteOne({ _id: groupid })

        }

        res.status(200).json({ message: "group Deleted" });

    } catch (err) {
        throw new DbError("Can't delete group")
    }
}))

app.post("/api/getUserId", asyncWrapper(async (req, res) => {

    // Get Request body
    const { token } = req.body;

    // Validate User input
    if (!token) throw Error("All inputs are required")

    // Find User
    const user = await UserModel.findOne({ token: token })

    if (!user) {
        throw new Error("User does not exist")
    }

    // Get User Account id
    const userId = user.id;

    // Send response
    res.status(200).json(userId)
}))

app.post("/api/sendInvite", asyncWrapper(async (req, res) => {

    // Get Request body
    const { username, groupId, token } = req.body;

    // Find User
    const user = await UserModel.findOne({ username: username }).catch(err => {
        console.log("No user")
    })

    // Find group owner
    const owner = await UserModel.findOne({ token: token})

    // Find group
    const group = await GroupModel.findOne({ _id: groupId})

    console.log(username);
    console.log(groupId);
    console.log(user);

    // Send Invite
    if (user != undefined && user != null && !user.invites.includes(groupId) && !user.groups.includes(groupId)
        && group.groupOwnerId.includes(owner.id)) {
        user.invites.push(groupId)
        await user.save();
    }

    //Send response
    res.status(200).json("Invite sent");

}))

app.post("/api/getInvites", asyncWrapper(async (req, res) => {

    // Get Request body
    const { token } = req.body;

    // Validate User input
    if (!token) throw Error("All inputs are required")

    // Find User
    const user = await UserModel.findOne({ token: token })

    if (!user) {
        throw new Error("User does not exist")
    }

    // Get invites
    const invites = user.invites;

    //Get groups from invites
    const groups = [];
    for (let i = 0; i < invites.length; i++) {
        console.log(invites[i]);
        const group = await GroupModel.findOne({ _id: invites[i] })
        console.log('group: ', group);
        groups.push(group);
    }

    // Send response
    res.status(200).json(groups)
}))

app.post('/api/declineInvite', asyncWrapper(async (req, res) => {

    const { groupid, token } = req.body;

    const user = await UserModel.findOne({ token: token })

    if (user != undefined && user != null && user.invites.includes(groupid)) {
        user.invites.pull(groupid);
        await user.save();
    }

    res.status(200).json("Declined Invite");

}))

app.post('/api/setMsgDeleteTime', asyncWrapper(async (req, res) => {

    const { groupid, token, deleteTime } = req.body;

    const group = await GroupModel.findOne({ _id: groupid })
    const user = await UserModel.findOne({ token: token })

    if (user != undefined && user != null && group.groupOwnerId.includes(user.id)) {
        group.messageDeleteTime = deleteTime;
        await group.save();
    }

    res.status(200).json("Message delete time set");

}))

//---------------------------- Message routes --------------------------------------------------------------------------

app.post("/api/message/create",  asyncWrapper(async (req, res) => {
    // Obtaining body parameters
    const { groupId, datePosted, content, token } = req.body;

    try {
        const user = await UserModel.findOne({ token: token })

        const message = await MessageModel.create({
            group: groupId,
            datePosted: datePosted,
            user: user.id,
            content: content
        })

        console.log(message);

        await message.save();

        res.status(200).json(message);
    } catch (err) {
        throw new DbError("Cannot create message")
    }
}));

app.post("/api/message/getAllFromGroup",  asyncWrapper(async (req, res) => {
    // Obtaining body parameters
    const { groupId } = req.body;

    try {

        const messages = await MessageModel.find({group: groupId})

        console.log("messages: ", messages);

        res.status(200).json(messages);
    } catch (err) {
        throw new DbError(err)
    }
}));

// ------------------------ End of message routes -----------------------------------------------

// Get User Account details
app.post("/api/account/get", asyncWrapper(async (req, res) => {
    console.log(req.body)
    // Get Request body
    const { token } = req.body;

    // Validate User input
    if (!token) throw Error("All inputs are required")

    // Find User
    const user = await UserModel.findOne({ token: token })
    console.log(user)
    if (!user) {
        throw new Error("User does not exist")
    }

    // Get User Account details
    const groupsJoined = user.groups.length
    const accountDeletionDate = user.accountDeletionDate == null ? "Not Scheduled" : user.accountDeletionDate
    const displayName = user.displayName

    // Send response
    res.status(200).json({ groupsJoined, accountDeletionDate, displayName })
}))

// Delete User Account
app.post("/api/account/delete", asyncWrapper(async (req, res) => {
    // Get Request body
    const { token } = req.body;

    // Validate User input
    if (!token) throw Error("All inputs are required")

    // Find User
    const user = await UserModel.findOne({ token: token })
    if (!user) {
        throw new Error("User does not exist")
    }

    // Remove User from Groups
    const groupids = user.groups;
    console.log("groupids: ", groupids);

    for (let i = 0; i < groupids.length; i++) {
        const group = await GroupModel.findOne({ _id: groupids[i] })
        console.log("<1>");
        // Delete groups if User is owner
        if( group.groupOwnerId.includes(user.id)){
            console.log("<2>");

            for (let i = 0; i < group.groupMembers.length; i++) {
                const member = await UserModel.findOne({ id: group.groupMembers[i] })
                console.log("<3>");

                //console.log("user: ", member);
                member.groups.pull(group._id);
                await member.save();
                //console.log("after remove group: ", member);
            }
            console.log("<4>");

            await GroupModel.deleteOne(group)

            console.log("<5>");


        } else {
            group.groupMember.pull(user);
            group.groupMemberCount = group.groupMemberCount - 1;
        }
    }

    // Delete User Account
    await UserModel.deleteOne({ token: token })
    res.status(200).json({ message: "Account Deleted" })
}))

app.put("/api/account/update/displayname", asyncWrapper(async (req, res) => {
    // Get Request body
    const { token, displayName } = req.body;
    console.log(req.body)

    // Validate User input
    if (!token) throw Error("All inputs are required")

    // Find User
    const user = await UserModel.findOne({ token: token })
    if (!user) {
        throw new Error("User does not exist")
    }

    // Update User Account
    user.displayName = displayName
    await user.save()
    res.status(200).json({ message: user.displayName })
}));


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
    console.log(`Example app listening at https://localhost:${port}`);
});
