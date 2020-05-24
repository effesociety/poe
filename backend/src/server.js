const express = require('express')
const app = express()
const path = require('path')
const eventEmitter = require('events')
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
if(process.env.NODE_ENV === "development"){
	janus()
}
else if(process.env.NODE_ENV === "production"){
	janus(server)
}

app.use('/api', apiRouter)
apiRouter.use('/users', userRoutes)
apiRouter.use('/courses', coursesRoutes)


if(process.env.NODE_ENV === "production"){
	const CLIENT_BUILD_PATH = path.join(__dirname, "../../frontend/build");
	// Static files
	app.use(express.static(CLIENT_BUILD_PATH));

	// Server React Client
	app.get("/", function(req, res) {
	  res.sendFile(path.join(CLIENT_BUILD_PATH , "index.html"));
	});
}

//Move this in another file if it becames too big
const Helpers = require('./utils/helpers')
const janusEventHandler =  Helpers.commonEmitter;
/*
janusEventHandler.on('joined', () => {
	console.log("ciao")
})
*/

if(process.env.JANUS_RELAY){
	const janusRelay = require('./janus/janus-event-handler-relay')
	janusRelay()
}
else{
	const eventsRoutes = require('./routes/events-api')
	app.use('/janus', eventsRoutes)
}
