const express = require('express')
const app = express()
const apiRouter = express.Router()
const mongo = require('./utils/db')
const utils = require('./utils/config')
const PORT = utils.PORT
const userRoutes = require('./routes/auth-api')
const coursesRoutes = require('./routes/courses-api')

const server = app.listen(PORT, () => {
	console.log("App running on port ", PORT)
})

mongo()

app.use('/api', apiRouter)
apiRouter.use('/users', userRoutes)
apiRouter.use('/courses', coursesRoutes)
