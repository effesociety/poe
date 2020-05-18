const JanusSession = require('./janus-session')
const JanusHandle = require('./janus-videoroom-handle')
const WebSocket = require('ws')
const utils = require('../utils/config')
const JANUS_URI = utils.JANUS_URI


var janusWebSocket = new WebSocket(JANUS_URI,"janus-protocol");

var session = new JanusSession(janusWebSocket.send.bind(janusWebSocket));
var handle = undefined;

janusWebSocket.onopen = () => {
  session.create();
}

janusWebSocket.onmessage = (ev) => {
  console.log("Received stuff")
  console.log(JSON.parse(ev.data))
  session.receive(JSON.parse(ev.data));
}

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', ws => {

  ws.on('message', async e => {
    let object = JSON.parse(e)
    console.log("Printing parsed object")
    console.log(object)

    if(object.message === 'start'){
      console.log("Received start message")
	  handle = new JanusHandle(session);    
	  await handle.attach("janus.plugin.videoroom");
	  await handle.join(5678,"publisher")
    }
    else if(object.message === 'trickle'){
      console.log("Received trickle message")
      let candidate = object.candidate;
      handle.sendTrickle(candidate || null);
    }
    else if(object.message === 'publish'){
      console.log("Received publish message")
      let offer = object.offer;
      let remote = await handle.publish(offer,true,true);
      let body = {
        "message": "answer",
        "jsep": remote.jsep
      }
      ws.send(JSON.stringify(body));
    }
    else if(object.message === 'getFeeds'){
      console.log("Received getFeeds message")
      handle = new JanusHandle(session)
      await handle.attach("janus.plugin.videoroom")
      let ev = await handle.listParticipants(5678)
      if(ev.plugindata){
        if(ev.plugindata.plugin === "janus.plugin.videoroom" && ev.plugindata.data.videoroom === "participants"){
          if(ev.plugindata.data.participants.length>0){
            var participants = ev.plugindata.data.participants;
            participants.forEach(participant => {
              let feed = participant.id;
              console.log("Printing participant id: ", feed);
              let object = await handle.join(5678, "subscriber", feed);
              let body = {
                "message": "offer",
                "jsep": object.jsep
              };
              ws.send(JSON.stringify(body));
            });
          }
        }
      }
    }
    else if(object.message === "subscribe"){
      console.log("Received subscribe message");
      handle.start(object.jsep)
    }	
  })
})