const JanusWrapper = require('./janus-wrapper');
const WebSocket = require('ws');

const janus = async () => {
    //Create Janus Session
    var janusWrapper = new JanusWrapper();
    await janusWrapper.init();

    //Create WebSocket server to communicate with users
    const wss = new WebSocket.Server({ port: process.env.WS_SERVER_PORT});

    wss.on('connection', ws => {

        ws.on('message', async e => {
            var object = JSON.parse(e);
            console.log("Received message on WebSocket:");
            console.log(object);

            //A student wants to start its media stream
            if(object.message === "start"){
                console.log("Received start message");
                ws.videoroomHandle = janusWrapper.addHandle();
                await ws.videoroomHandle.attach("janus.plugin.videoroom");
                await ws.handle.join(5678, "publisher");
            }
            //There are ICE candidates ready to be sent
            else if(object.message === "trickle"){
                console.log("Received trickle message");
                let candidate = object.candidate;
                if(ws.videoroomHandle){
                    ws.videoroomHandle.sendTrickle(candidate || null);
                }
            }
            //The media stream is ready to be published
            else if(object.message === "publish"){
                console.log("Received publish message");
                let offer = object.offer;
                if(ws.videoroomHandle){
                    let remote = await ws.videoroomHandle.publish(offer,true,true);
                    let body = {
                        "message": "answer",
                        "jsep": remote.jsep
                    }
                    ws.send(JSON.stringify(body));
                }
            }
            //The teacher wants to get all feeds
            else if(object.message === "getFeeds"){
                console.log("Received getFeeds message");
                ws.videoroomHandle = janusWrapper.addHandle();
                await ws.videoroomHandle.attach("janus.plugin.videoroom");
                let ev = await ws.videoroomHandle.listParticipants(5678);
                if(ev.plugindata){
                    if(ev.plugindata.plugin === "janus.plugin.videoroom" && ev.plugindata.data.videoroom === "participants"){
                        if(ev.plugindata.data.participants.length>0){
                          var participants = ev.plugindata.data.participants;
                          participants.forEach(async (participant) => {
                            let feed = participant.id;
                            console.log("Printing participant id: ", feed);
                            let object = await ws.videoroomHandle.join(5678, "subscriber", feed);
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
            //The teacher wants to subscribe to a particular feed
            else if(object.message === "subscribe"){
                console.log("Received subscribe message");
                ws.videoroomHandle.start(object.jsep);
            }
        })

    })
}

module.exports = janus
