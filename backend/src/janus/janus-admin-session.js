const axios = require('axios');


const destroyRoom = (room) => {
    var message = {
        request: "destroy",
        room: room
    }
    return axios.post(process.env.JANUS_ADMIN_URI,{
        janus: "message_plugin",
        admin_secret: process.env.JANUS_ADMIN_SECRET,
        plugin: "janus.plugin.videoroom",
        transaction: Math.random().toString(36).substring(2),
        request: message
    })
    .then(res => {
        console.log("Result from Janus destroy room admin request")
        console.log(res.data)
        return
    })
    .catch(err => {
        console.log(err)
    })
}

const listParticipants = (room) => {
    var message = {
        request: "listparticipants",
        room: room
    }
    return axios.post(process.env.JANUS_ADMIN_URI,{
        janus: "message_plugin",
        admin_secret: process.env.JANUS_ADMIN_SECRET,
        plugin: "janus.plugin.videoroom",
        transaction: Math.random().toString(36).substring(2),
        request: message
    })
    .then(res => {
        console.log("Result from Janus list participants on room", room)
        return res.data.response.participants
    })
    .catch(err => {
        console.log(err)
    })
}

exports.destroyRoom = destroyRoom
exports.listParticipants = listParticipants
