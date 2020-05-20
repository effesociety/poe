/*
This file is just for testing and developing in localhost environment using
also the features provided by the plugin Event Handler.
A simple Node.js app is published on Heroku and it has the task to relay all events
received from Janus to all sockets connected and authenticated.
Then, in localhost, a POST request has to be made to simulate the event coming directly from Janus.
*/
const io = require('socket.io-client');
const socket = io(process.env.EVENT_HANDLER_RELAY_URI)
const axios = require('axios');


const janusRelay = () => {
	socket.emit('identify', process.env.EVENT_HANDLER_SECRET);

	socket.on('janusEvent',(body) => {
		console.log("[JANUS-EVENT-HANDLER-RELAY] Relay received a body of an event...Making POST request to /events");

		console.log(body)
		/*
		axios.post('/events', body)
		.then((res) => {
			console.log("[JANUS-EVENT-HANDLER-RELAY] POST request made. Status response: ", res.status);
		}).catch((err) => {
			console.log("[JANUS-EVENT-HANDLER-RELAY] Error in making POST request");
			console.error(err);
		});	
		*/
	})
}

module.exports = janusRelay;