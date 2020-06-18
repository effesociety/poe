const express = require('express')
const app = express()
const path = require('path')
const mongo = require('./utils/db')
const apiRouter = express.Router()
const { userRoutes, coursesRoutes, eventsRoutes, examsRoutes } = require('./routes/api')
const janus = require('./janus/janus')

//Setup for ENV variables
require('dotenv').config()

const server = app.listen(process.env.PORT, () => {
	console.log("App running on port ", process.env.PORT)
})

//Setup for MongoDB
mongo()

//Setup for Janus
janus(server)

app.use('/api', apiRouter)
apiRouter.use('/users', userRoutes)
apiRouter.use('/courses', coursesRoutes)

if(process.env.NODE_ENV === "production"){
	const CLIENT_BUILD_PATH = path.join(__dirname, "../../frontend/build")
	// Static files
	app.use(express.static(CLIENT_BUILD_PATH));

	// Server React Client
	app.get("/", function(req, res) {
	  res.sendFile(path.join(CLIENT_BUILD_PATH , "index.html"))
	});
}

if(process.env.JANUS_RELAY){
	const janusRelay = require('./janus/janus-event-handler-relay')
	janusRelay()
}
else{
	app.use('/janus', eventsRoutes)
}
