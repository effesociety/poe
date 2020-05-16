const JanusSession = require('./janus/janus-session')
const JanusHandle = require('./janus/janus-videoroom-handle')
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
      try{
        
        handle = new JanusHandle(session);    
        await handle.attach("janus.plugin.videoroom");
        await handle.join(5678,"publisher")
      }
      catch(err){
        console.log(err)
      }
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
  })
})



const express = require('express');
const app = express();

app.use(express.static('public'));

app.listen(3000, () => console.log('Gator app listening on port 3000!'));