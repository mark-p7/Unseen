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

server.listen(port, () => {
    console.log(`Example app listening at https://localhost:${port}`);
});