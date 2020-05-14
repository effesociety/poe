const express = require('express')
const app = express()
const http = require('http')
const mongoServer = require('./config/db')
const userSchema = require('./model/userSchema')
const tokenSchema = require('./model/tokenSchema')

const port = 3001
const utils = require('./config/utils')

// ***** SERVER SETUP *****
const server = app.listen(port, () => {
  console.log("App running on port ",port)
})

// ***** DATABASE SETUP *****
mongoServer()
