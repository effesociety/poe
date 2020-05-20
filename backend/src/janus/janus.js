const JanusWrapper = require('./janus-wrapper');
const WebSocket = require('ws');

const janus = async (server) => {
    //Create Janus Session
    var janusWrapper = new JanusWrapper();
    await janusWrapper.init();

    //Create WebSocket server to communicate with users
	if(process.env.NODE_ENV === "development"){
		const wss = new WebSocket.Server({ port: process.env.WS_SERVER_PORT });
	}
	else if(process.env.NODE_ENV === "production" && server){
		const wss = new WebSocket.Server({ server })
	}

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
                await ws.videoroomHandle.join(1234, "publisher");
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
                        "jsep": remote.jsep,
                        "publisherID": ws.videoroomHandle.id
                    }
                    ws.send(JSON.stringify(body));
                }
            }
            //The teacher wants to get all feeds
            else if(object.message === "getFeeds"){
                console.log("Received getFeeds message");
                ws.videoroomHandle = janusWrapper.addHandle();
                await ws.videoroomHandle.attach("janus.plugin.videoroom");
                let ev = await ws.videoroomHandle.listParticipants(1234);
                if(ev.plugindata){
                    if(ev.plugindata.plugin === "janus.plugin.videoroom" && ev.plugindata.data.videoroom === "participants"){
                        if(ev.plugindata.data.participants.length>0){
                          var participants = ev.plugindata.data.participants;
                          ws.subscriberHandles = {}
                          participants.forEach(async (participant) => {
                            let feed = participant.id;
                            console.log("Printing participant id: ", feed);
                            let subscriberHandle = janusWrapper.addHandle();
                            await subscriberHandle.attach("janus.plugin.videoroom");
                            ws.subscriberHandles[subscriberHandle.id] = subscriberHandle;
                            console.log("Printing ID of this subscriber handle")
                            console.log(subscriberHandle.id)
                            let object = await subscriberHandle.join(1234, "subscriber", feed);
                            let body = {
                              "message": "offer",
                              "jsep": object.jsep,
                              "subscriberID": subscriberHandle.id
                            };
                            console.log("Sending offer to ",subscriberHandle.id)
                            ws.send(JSON.stringify(body));
                          });
                        }
                    }
                }
            }
            //The teacher wants to subscribe to a particular feed
            else if(object.message === "subscribe"){
                console.log("Received subscribe message");
                console.log("Printing subscriber ID");
                console.log(object.subscriberID)
                ws.subscriberHandles[object.subscriberID].start(object.jsep);
            }
        })

    })
}

module.exports = janus
