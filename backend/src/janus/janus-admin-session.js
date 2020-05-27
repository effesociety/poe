const axios = require('axios');

module.exports = class JanusAdminSession{

    destroyRoom(room){
        var message = {
            request: "destroy",
            room: room
        }
        axios.post(process.env.JANUS_ADMIN_URI,{
            janus: "message_plugin",
            admin_secret: process.env.JANUS_ADMIN_SECRET,
            plugin: "janus.plugin.videoroom",
            transaction: Math.random().toString(36).substring(2),
            request: message
        })
        .then(res => {
            console.log("Result from Janus destroy room admin request")
            console.log(res.data)
        })
        .catch(err => {
            console.log(err)
        })
    }
}
