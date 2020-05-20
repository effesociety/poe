const express = require('express')
const app = express()
const apiRouter = express.Router()
const mongo = require('./utils/db')
const userRoutes = require('./routes/auth-api')
const coursesRoutes = require('./routes/courses-api')
const janus = require('./janus/janus')

//Setup for ENV variables
require('dotenv').config()

const server = app.listen(process.env.PORT, () => {
	console.log("App running on port ", process.env.PORT)
})

//Setup for MongoDB
mongo()

//Setup for Janus
janus()


app.use('/api', apiRouter)
apiRouter.use('/users', userRoutes)
apiRouter.use('/courses', coursesRoutes)


const janusRelay = require('./janus/janus-event-handler-relay')
janusRelay()

